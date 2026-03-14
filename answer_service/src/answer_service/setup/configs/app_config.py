import os

from pydantic import BaseModel, Field

from answer_service.setup.configs.asgi_config import ASGIConfig
from answer_service.setup.configs.chroma_config import ChromaConfig
from answer_service.setup.configs.database_config import PostgresConfig, SQLAlchemyConfig
from answer_service.setup.configs.llm_config import OpenAIConfig


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
