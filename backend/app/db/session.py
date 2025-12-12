"""Database session dependency for FastAPI."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """A FastAPI dependency that provides an async db session with automatic lifecycle management.

    Creates a new SQLAlchemy async session for each request, yields it to the endpoint,
    then automatically commits the transaction on success or rolls back on error.
    The session is always closed after use, ensuring proper connection pool management.
    Use this as a dependency in any endpoint that needs database access.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
