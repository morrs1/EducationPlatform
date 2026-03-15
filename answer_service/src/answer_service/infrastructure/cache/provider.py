from collections.abc import AsyncIterator

from redis.asyncio import ConnectionPool, Redis

from answer_service.setup.configs.redis_config import RedisConfig


async def get_redis(redis_config: RedisConfig) -> AsyncIterator[Redis]:
    pool: ConnectionPool = ConnectionPool.from_url(redis_config.cache_uri)
    client: Redis = Redis(connection_pool=pool)
    try:
        yield client
    finally:
        await client.aclose()
        await pool.aclose()
