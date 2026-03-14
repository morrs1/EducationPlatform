import os

from pydantic import BaseModel, Field

from answer_service.setup.configs.asgi_config import ASGIConfig
from answer_service.setup.configs.database_config import PostgresConfig, SQLAlchemyConfig


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