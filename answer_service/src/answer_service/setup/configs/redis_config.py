from typing import Final

from pydantic import BaseModel, Field, RedisDsn, field_validator

from answer_service.setup.configs.consts import PORT_MAX, PORT_MIN

REDIS_DB_MIN: Final[int] = 0
REDIS_DB_MAX: Final[int] = 15


class RedisConfig(BaseModel):
    host: str = Field(
        alias="REDIS_HOST",
        description="Redis host",
    )
    port: int = Field(
        alias="REDIS_PORT",
        description="Redis port",
    )
    password: str = Field(
        alias="REDIS_PASSWORD",
        default="",
        description="Redis password",
    )
    worker_db: int = Field(
        alias="REDIS_WORKER_DB",
        default=1,
        description="Redis DB index for taskiq result backend",
    )
    schedule_source_db: int = Field(
        alias="REDIS_SCHEDULE_SOURCE_DB",
        default=2,
        description="Redis DB index for taskiq schedule source",
    )

    @field_validator("port")
    @classmethod
    def validate_port(cls, v: int) -> int:
        if not PORT_MIN <= v <= PORT_MAX:
            raise ValueError(
                f"REDIS_PORT must be between {PORT_MIN} and {PORT_MAX}, got {v}."
            )
        return v

    @field_validator("worker_db", "schedule_source_db")
    @classmethod
    def validate_redis_db(cls, v: int) -> int:
        if not REDIS_DB_MIN <= v <= REDIS_DB_MAX:
            raise ValueError(
                f"Redis DB index must be between {REDIS_DB_MIN} and {REDIS_DB_MAX}, got {v}."
            )
        return v

    @property
    def worker_uri(self) -> str:
        return str(
            RedisDsn.build(
                scheme="redis",
                host=self.host,
                port=self.port,
                password=self.password or None,
                path=f"/{self.worker_db}",
            )
        )

    @property
    def schedule_source_uri(self) -> str:
        return str(
            RedisDsn.build(
                scheme="redis",
                host=self.host,
                port=self.port,
                password=self.password or None,
                path=f"/{self.schedule_source_db}",
            )
        )
