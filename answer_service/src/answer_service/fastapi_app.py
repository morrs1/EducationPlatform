import logging
import sys
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import TYPE_CHECKING, Final, cast

import uvicorn
from dishka import AsyncContainer, make_async_container
from dishka.integrations.fastapi import setup_dishka
from dishka_faststream import setup_dishka as setup_faststream_dishka
from fastapi import FastAPI
from faststream.asgi.factories.asyncapi import make_asyncapi_asgi
from faststream.rabbit import RabbitBroker
from faststream.specification.asyncapi import AsyncAPI
from sqlalchemy.orm import clear_mappers
from taskiq import AsyncBroker

from answer_service._version import __version__
from answer_service.setup.bootstrap import (
    setup_configs,
    setup_http_exc_handlers,
    setup_http_middlewares,
    setup_http_routes,
    setup_map_tables,
    setup_rabbit_broker,
    setup_rabbit_routes,
    setup_task_manager,
    setup_task_manager_tasks,
)
from answer_service.setup.configs.asgi_config import ASGIConfig
from answer_service.setup.configs.chroma_config import ChromaConfig
from answer_service.setup.configs.database_config import PostgresConfig, SQLAlchemyConfig
from answer_service.setup.configs.llm_config import OpenAIConfig
from answer_service.setup.configs.redis_config import RedisConfig
from answer_service.setup.ioc import setup_providers

if TYPE_CHECKING:
    from answer_service.setup.configs.app_config import AppConfig

logger: Final[logging.Logger] = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Async context manager for FastAPI application lifecycle management."""
    task_manager: AsyncBroker = cast("AsyncBroker", app.state.task_manager)
    rabbit_broker: RabbitBroker = cast("RabbitBroker", app.state.rabbit_broker)
    container: AsyncContainer = cast("AsyncContainer", app.state.dishka_container)

    if not task_manager.is_worker_process:
        logger.info("Setting up taskiq")
        await task_manager.startup()

    logger.info("Starting FastStream RabbitMQ broker")
    setup_faststream_dishka(container, broker=rabbit_broker)
    await rabbit_broker.start()

    yield

    logger.info("Stopping FastStream RabbitMQ broker")
    await rabbit_broker.close()

    if not task_manager.is_worker_process:
        logger.info("Shutting down taskiq")
        await task_manager.shutdown()

    clear_mappers()
    await container.close()


def create_fastapi_app() -> FastAPI:  # pragma: no cover
    """Creates and configures a FastAPI application instance with all dependencies."""
    configs: AppConfig = setup_configs()
    setup_map_tables()

    task_manager: AsyncBroker = setup_task_manager(
        taskiq_config=configs.taskiq,
        rabbitmq_config=configs.rabbit,
        redis_config=configs.redis,
    )
    setup_task_manager_tasks(task_manager)

    rabbit_broker: RabbitBroker = setup_rabbit_broker(configs.rabbit)
    setup_rabbit_routes(rabbit_broker)

    app: FastAPI = FastAPI(
        lifespan=lifespan,
        version=__version__,
        root_path="/api",
        debug=configs.asgi.fastapi_debug,
    )

    app.state.task_manager = task_manager
    app.state.rabbit_broker = rabbit_broker

    # Expose FastStream AsyncAPI docs at /asyncapi
    app.mount("/asyncapi", make_asyncapi_asgi(AsyncAPI(rabbit_broker)))

    context = {
        ASGIConfig: configs.asgi,
        SQLAlchemyConfig: configs.alchemy,
        PostgresConfig: configs.postgres,
        ChromaConfig: configs.chroma,
        OpenAIConfig: configs.openai,
        RedisConfig: configs.redis,
        AsyncBroker: task_manager,
        RabbitBroker: rabbit_broker,
    }

    container: AsyncContainer = make_async_container(*setup_providers(), context=context)
    setup_http_routes(app)
    setup_http_exc_handlers(app)
    setup_http_middlewares(app, api_config=configs.asgi)
    setup_dishka(container, app)
    logger.info("App created", extra={"app_version": app.version})
    return app


if __name__ == "__main__":
    asgi_conf = setup_configs().asgi

    uvicorn.run(
        create_fastapi_app(),
        host=asgi_conf.host,
        port=asgi_conf.port,
        loop="uvloop" if sys.platform != "win32" else "asyncio",
    )
