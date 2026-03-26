import os

from pydantic import BaseModel, Field

from answer_service.setup.configs.asgi_config import ASGIConfig
from answer_service.setup.configs.broker_config import RabbitConfig
from answer_service.setup.configs.chroma_config import ChromaConfig
from answer_service.setup.configs.database_config import PostgresConfig, SQLAlchemyConfig
from answer_service.setup.configs.llm_config import OpenAIConfig
from answer_service.setup.configs.redis_config import RedisConfig
from answer_service.setup.configs.taskiq_config import TaskIQConfig


class AppConfig(BaseModel):
    postgres: PostgresConfig = Field(
        default_factory=lambda: PostgresConfig(**os.environ),
        description="Postgres settings",
    )
    alchemy: SQLAlchemyConfig = Field(
        default_factory=lambda: SQLAlchemyConfig(**os.environ),
        description="SQLAlchemy settings",
    )
    asgi: ASGIConfig = Field(
        default_factory=lambda: ASGIConfig(**os.environ),
        description="ASGI settings",
    )
    chroma: ChromaConfig = Field(
        default_factory=lambda: ChromaConfig(**os.environ),
        description="ChromaDB settings",
    )
    openai: OpenAIConfig = Field(
        default_factory=lambda: OpenAIConfig(**os.environ),
        description="OpenAI settings",
    )
    rabbit: RabbitConfig = Field(
        default_factory=lambda: RabbitConfig(**os.environ),
        description="RabbitMQ settings",
    )
    redis: RedisConfig = Field(
        default_factory=lambda: RedisConfig(**os.environ),
        description="Redis settings",
    )
    taskiq: TaskIQConfig = Field(
        default_factory=TaskIQConfig,
        description="TaskIQ worker settings",
    )
