"""Redis connection management with pooling."""

import redis.asyncio as aioredis
from redis.asyncio import ConnectionPool

from app.core.config import settings


class RedisClient:
    """Singleton Redis client manager with connection pooling.

    Creates a single connection pool shared across the application.
    Prevents connection leaks and enables efficient resource usage.
    """

    _instance: aioredis.Redis | None = None
    _pool: ConnectionPool | None = None

    @classmethod
    async def get_instance(cls) -> aioredis.Redis:
        """Get or create Redis client instance.

        Uses connection pooling for efficiency. Safe to call multiple times.
        """
        if cls._instance is None:
            cls._pool = ConnectionPool.from_url(
                settings.REDIS_URL,
                max_connections=settings.REDIS_MAX_CONNECTIONS,
                socket_keepalive=settings.REDIS_SOCKET_KEEPALIVE,
                socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
                decode_responses=True,  # Return strings instead of bytes
            )
            cls._instance = aioredis.Redis(connection_pool=cls._pool)

        return cls._instance

    @classmethod
    async def close(cls) -> None:
        """Close Redis connection pool."""
        if cls._instance:
            await cls._instance.aclose()
            cls._instance = None
        if cls._pool:
            await cls._pool.aclose()
            cls._pool = None


# Convenience function
async def get_redis() -> aioredis.Redis:
    """Get Redis client instance (dependency injection)."""
    return await RedisClient.get_instance()