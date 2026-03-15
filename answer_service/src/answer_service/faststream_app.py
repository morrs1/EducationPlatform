"""FastStream RabbitMQ consumer entry point.

Run with:
    faststream run answer_service.faststream_app:create_faststream_app
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Final, cast

from dishka import AsyncContainer, make_async_container
from dishka_faststream import setup_dishka
from faststream import ContextRepo
from faststream.asgi import AsgiFastStream
from faststream.rabbit import RabbitBroker
from sqlalchemy.orm import clear_mappers
from taskiq import AsyncBroker

from answer_service.setup.bootstrap import (
    setup_map_tables,
    setup_rabbit_broker,
    setup_rabbit_routes,
    setup_task_manager,
    setup_task_manager_tasks,
)
from answer_service.setup.configs.app_config import AppConfig
from answer_service.setup.configs.asgi_config import ASGIConfig
from answer_service.setup.configs.broker_config import RabbitConfig
from answer_service.setup.configs.chroma_config import ChromaConfig
from answer_service.setup.configs.database_config import PostgresConfig, SQLAlchemyConfig
from answer_service.setup.configs.llm_config import OpenAIConfig
from answer_service.setup.configs.redis_config import RedisConfig
from answer_service.setup.ioc import setup_providers

logger: Final[logging.Logger] = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(context: ContextRepo) -> AsyncIterator[None]:  # pragma: no cover
    """FastStream consumer lifecycle.

    Retrieves the broker from FastStream's own context (set automatically by
    AsgiFastStream before the lifespan runs), then bootstraps everything that
    depends on runtime resources: taskiq broker and the Dishka IoC container.
    """
    rabbit_broker: RabbitBroker = cast(
        "RabbitBroker", cast("AsgiFastStream", context.get("app")).broker
    )

    configs: AppConfig = AppConfig()
    setup_map_tables()

    task_manager: AsyncBroker = setup_task_manager(
        taskiq_config=configs.taskiq,
        rabbitmq_config=configs.rabbit,
        redis_config=configs.redis,
    )
    setup_task_manager_tasks(task_manager)

    dishka_context = {
        ASGIConfig: ASGIConfig(),
        PostgresConfig: configs.postgres,
        SQLAlchemyConfig: configs.alchemy,
        RabbitConfig: configs.rabbit,
        ChromaConfig: configs.chroma,
        OpenAIConfig: configs.openai,
        RedisConfig: configs.redis,
        AsyncBroker: task_manager,
        RabbitBroker: rabbit_broker,
    }

    container: AsyncContainer = make_async_container(
        *setup_providers(), context=dishka_context
    )
    setup_dishka(container, broker=rabbit_broker)

    context.set_global("task_manager", task_manager)

    if not task_manager.is_worker_process:
        logger.info("Setting up taskiq")
        await task_manager.startup()

    yield

    if not task_manager.is_worker_process:
        logger.info("Shutting down taskiq")
        await task_manager.shutdown()

    await container.close()
    clear_mappers()


def create_faststream_app() -> AsgiFastStream:  # pragma: no cover
    """Create the FastStream consumer application.

    Only wires the RabbitMQ broker and subscribers.  All runtime resources
    (taskiq, Redis, Dishka container) are initialised inside ``lifespan``.
    """
    rabbit_broker: RabbitBroker = setup_rabbit_broker(AppConfig().rabbit)
    setup_rabbit_routes(rabbit_broker)
    return AsgiFastStream(rabbit_broker, lifespan=lifespan)
