"""Celery tasks package.

Imports all task modules to register them with Celery worker.
"""

from app.tasks.review_task import process_pr_review

__all__ = ["process_pr_review"]