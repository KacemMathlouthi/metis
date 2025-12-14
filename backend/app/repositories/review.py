"""Review repository for database operations on Review and ReviewComment models.

Provides data access methods for creating and querying code reviews and their
associated inline comments. Includes queries for review status tracking, filtering
by repository or installation, and aggregating review statistics.
"""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.review import Review, ReviewComment


class ReviewRepository:
    """Data access layer for Review model.

    Encapsulates queries for PR reviews including status tracking,
    filtering by various criteria, and retrieving reviews with their
    associated comments for complete review data.
    """

    @staticmethod
    async def get_by_id(db: AsyncSession, review_id: UUID | str) -> Review | None:
        """Get review by UUID.

        Args:
            db: Database session
            review_id: Review UUID

        Returns:
            Review object if found, None otherwise
        """
        result = await db.execute(select(Review).where(Review.id == review_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_pr(db: AsyncSession, repository: str, pr_number: int) -> list[Review]:
        """Get all reviews for a specific pull request.

        A PR may have multiple reviews if it's updated multiple times.
        Returns them ordered by most recent first.

        Args:
            db: Database session
            repository: Repository in format 'owner/repo'
            pr_number: Pull request number

        Returns:
            List of Review objects ordered by created_at DESC
        """
        result = await db.execute(
            select(Review)
            .where(and_(Review.repository == repository, Review.pr_number == pr_number))
            .order_by(Review.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_installation(
        db: AsyncSession,
        installation_id: UUID | str,
        status: str | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Review]:
        """Get reviews for an installation with optional status filter.

        Args:
            db: Database session
            installation_id: Installation UUID
            status: Optional status filter (PENDING, PROCESSING, COMPLETED, FAILED)
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return

        Returns:
            List of Review objects ordered by created_at DESC
        """
        query = select(Review).where(Review.installation_id == installation_id)

        if status:
            query = query.where(Review.status == status)

        query = query.order_by(Review.created_at.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def create(
        db: AsyncSession,
        installation_id: UUID | str,
        pr_number: int,
        repository: str,
        commit_sha: str,
        metadata: dict | None = None,
    ) -> Review:
        """Create new review record in PENDING status.

        Args:
            db: Database session
            installation_id: Installation UUID
            pr_number: Pull request number
            repository: Repository in format 'owner/repo'
            commit_sha: Git commit SHA being reviewed
            metadata: Optional PR metadata (title, author, etc.)

        Returns:
            Created Review object
        """
        review = Review(
            installation_id=installation_id,
            pr_number=pr_number,
            repository=repository,
            commit_sha=commit_sha,
            pr_metadata=metadata or {},
            status="PENDING",
        )

        db.add(review)
        await db.flush()
        await db.refresh(review)

        return review

    @staticmethod
    async def update_status(
        db: AsyncSession,
        review: Review,
        status: str,
        error: str | None = None,
    ) -> Review:
        """Update review status and timestamps.

        Automatically sets started_at when status changes to PROCESSING
        and completed_at when status changes to COMPLETED or FAILED.

        Args:
            db: Database session
            review: Review object to update
            status: New status (PENDING, PROCESSING, COMPLETED, FAILED)
            error: Error message if status is FAILED

        Returns:
            Updated Review object
        """
        old_status = review.status
        review.status = status

        # Set timestamps based on status
        if status == "PROCESSING" and old_status == "PENDING":
            review.started_at = datetime.now(timezone.utc)

        if status in ["COMPLETED", "FAILED"]:
            review.completed_at = datetime.now(timezone.utc)

        if error:
            review.error = error

        await db.flush()
        await db.refresh(review)

        return review

    @staticmethod
    async def add_review_text(db: AsyncSession, review: Review, review_text: str) -> Review:
        """Add review summary text after AI generation.

        Args:
            db: Database session
            review: Review object to update
            review_text: Overall review summary from AI

        Returns:
            Updated Review object
        """
        review.review_text = review_text

        await db.flush()
        await db.refresh(review)

        return review

    @staticmethod
    async def get_pending_reviews(db: AsyncSession, limit: int = 10) -> list[Review]:
        """Get pending reviews ordered by creation time.

        Useful for background workers to pick up reviews that need processing.

        Args:
            db: Database session
            limit: Maximum number of reviews to return

        Returns:
            List of Review objects with status=PENDING
        """
        result = await db.execute(
            select(Review)
            .where(Review.status == "PENDING")
            .order_by(Review.created_at.asc())
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def create_pending_review(
        db: AsyncSession,
        installation_id: UUID | str,
        repository: str,
        pr_number: int,
        commit_sha: str,
        pr_metadata: dict,
        celery_task_id: str,
    ) -> Review:
        """Create Review record in PENDING state with Celery task ID.

        Used by webhook handler to create review before queueing async task.

        Args:
            db: Database session
            installation_id: Installation UUID
            repository: Repository in format 'owner/repo'
            pr_number: Pull request number
            commit_sha: Git commit SHA being reviewed
            pr_metadata: PR metadata (title, author, url, etc.)
            celery_task_id: Celery task ID for tracking

        Returns:
            Created Review object with PENDING status
        """
        review = Review(
            installation_id=installation_id,
            repository=repository,
            pr_number=pr_number,
            commit_sha=commit_sha,
            pr_metadata=pr_metadata,
            status="PENDING",
            celery_task_id=celery_task_id,
        )

        db.add(review)
        await db.flush()
        await db.refresh(review)

        return review


class ReviewCommentRepository:
    """Data access layer for ReviewComment model.

    Encapsulates queries for individual code review comments including
    creating comments, querying by file or severity, and managing the
    posting status to GitHub.
    """

    @staticmethod
    async def create(
        db: AsyncSession,
        review_id: UUID | str,
        file_path: str,
        line_number: int,
        comment_text: str,
        severity: str,
        category: str,
        line_end: int | None = None,
    ) -> ReviewComment:
        """Create new review comment.

        Args:
            db: Database session
            review_id: Review UUID this comment belongs to
            file_path: Path to file (e.g., 'src/main.py')
            line_number: Starting line number
            comment_text: The actual comment message
            severity: INFO, WARNING, ERROR, or CRITICAL
            category: BUG, SECURITY, PERFORMANCE, etc.
            line_end: Ending line number for multi-line comments

        Returns:
            Created ReviewComment object
        """
        comment = ReviewComment(
            review_id=review_id,
            file_path=file_path,
            line_number=line_number,
            line_end=line_end,
            comment_text=comment_text,
            severity=severity,
            category=category,
        )

        db.add(comment)
        await db.flush()
        await db.refresh(comment)

        return comment

    @staticmethod
    async def get_by_review(db: AsyncSession, review_id: UUID | str) -> list[ReviewComment]:
        """Get all comments for a review.

        Args:
            db: Database session
            review_id: Review UUID

        Returns:
            List of ReviewComment objects ordered by file_path, then line_number
        """
        result = await db.execute(
            select(ReviewComment)
            .where(ReviewComment.review_id == review_id)
            .order_by(ReviewComment.file_path, ReviewComment.line_number)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_severity(
        db: AsyncSession, review_id: UUID | str, severity: str
    ) -> list[ReviewComment]:
        """Get comments filtered by severity level.

        Args:
            db: Database session
            review_id: Review UUID
            severity: Severity level (INFO, WARNING, ERROR, CRITICAL)

        Returns:
            List of ReviewComment objects with matching severity
        """
        result = await db.execute(
            select(ReviewComment).where(
                and_(ReviewComment.review_id == review_id, ReviewComment.severity == severity)
            )
        )
        return list(result.scalars().all())

    @staticmethod
    async def mark_posted(
        db: AsyncSession, comment: ReviewComment, github_comment_id: int
    ) -> ReviewComment:
        """Mark comment as posted to GitHub.

        Records the GitHub comment ID after successfully posting
        the comment via GitHub API.

        Args:
            db: Database session
            comment: ReviewComment object
            github_comment_id: GitHub API comment ID

        Returns:
            Updated ReviewComment object
        """
        comment.github_comment_id = github_comment_id

        await db.flush()
        await db.refresh(comment)

        return comment

    @staticmethod
    async def count_by_severity(db: AsyncSession, review_id: UUID | str) -> dict[str, int]:
        """Count comments by severity for a review.

        Useful for displaying review summary statistics.

        Args:
            db: Database session
            review_id: Review UUID

        Returns:
            Dict mapping severity to count: {'CRITICAL': 2, 'ERROR': 5, ...}
        """
        result = await db.execute(
            select(ReviewComment.severity, func.count(ReviewComment.id))
            .where(ReviewComment.review_id == review_id)
            .group_by(ReviewComment.severity)
        )

        counts: dict[str, int] = {row[0]: row[1] for row in result.all()}
        return counts
