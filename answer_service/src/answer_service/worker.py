"""Taskiq worker entry point.

Run with:
    taskiq worker answer_service.worker:broker
"""

import logging
from typing import Final

from dishka import AsyncContainer, make_async_container
from dishka.integrations.taskiq import setup_dishka
from sqlalchemy.orm import clear_mappers
from taskiq import AsyncBroker, TaskiqEvents, TaskiqState

from answer_service.setup.bootstrap import (
    setup_map_tables,
    setup_task_manager,
    setup_task_manager_middlewares,
    setup_task_manager_tasks,
)
from answer_service.setup.configs.app_config import AppConfig
from answer_service.setup.configs.broker_config import RabbitConfig
from answer_service.setup.configs.chroma_config import ChromaConfig
from answer_service.setup.configs.database_config import PostgresConfig, SQLAlchemyConfig
from answer_service.setup.configs.llm_config import OpenAIConfig
from answer_service.setup.configs.redis_config import RedisConfig
from answer_service.setup.ioc import setup_providers

logger: Final[logging.Logger] = logging.getLogger(__name__)


async def startup(state: TaskiqState) -> None:  # noqa: ARG001, RUF029
    setup_map_tables()
    logger.info("Taskiq worker started")


async def shutdown(state: TaskiqState) -> None:  # noqa: ARG001, RUF029
    clear_mappers()
    logger.info("Taskiq worker stopped")


def create_worker_taskiq_app() -> AsyncBroker:
    """Create and configure the taskiq worker application."""
    configs: AppConfig = AppConfig()

    worker_broker: AsyncBroker = setup_task_manager(
        taskiq_config=configs.taskiq,
        rabbitmq_config=configs.rabbit,
        redis_config=configs.redis,
    )
    worker_broker = setup_task_manager_middlewares(
        broker=worker_broker, taskiq_config=configs.taskiq
    )
    setup_task_manager_tasks(broker=worker_broker)

    worker_broker.on_event(TaskiqEvents.WORKER_STARTUP)(startup)
    worker_broker.on_event(TaskiqEvents.WORKER_SHUTDOWN)(shutdown)

    context = {
        PostgresConfig: configs.postgres,
        SQLAlchemyConfig: configs.alchemy,
        RabbitConfig: configs.rabbit,
        ChromaConfig: configs.chroma,
        OpenAIConfig: configs.openai,
        RedisConfig: configs.redis,
        AsyncBroker: worker_broker,
    }

    container: AsyncContainer = make_async_container(*setup_providers(), context=context)
    setup_dishka(container, broker=worker_broker)

    return worker_broker
