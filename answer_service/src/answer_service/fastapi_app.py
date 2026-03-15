import logging
import sys
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import TYPE_CHECKING, Final, cast

import uvicorn
from dishka import AsyncContainer, make_async_container
from dishka.integrations.fastapi import setup_dishka
from fastapi import FastAPI
from sqlalchemy.orm import clear_mappers
from taskiq import AsyncBroker

from answer_service._version import __version__
from answer_service.setup.bootstrap import (
    setup_configs,
    setup_http_exc_handlers,
    setup_http_middlewares,
    setup_http_routes,
    setup_map_tables,
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
    """Async context manager for FastAPI application lifecycle management.

    Ensures proper cleanup of the Dishka container and SQLAlchemy mapper
    registry on shutdown. The outbox relay runs in the separate taskiq
    worker process — the FastAPI app itself has no broker connection.
    """
    task_manager: AsyncBroker = cast("AsyncBroker", app.state.task_manager)

    if not task_manager.is_worker_process:
        logger.info("Setting up taskiq")
        await task_manager.startup()

    yield

    if not task_manager.is_worker_process:
        logger.info("Shutting down taskiq")
        await task_manager.shutdown()

    clear_mappers()
    await cast("AsyncContainer", app.state.dishka_container).close()


def create_fastapi_app() -> FastAPI:  # pragma: no cover
    """Creates and configures a FastAPI application instance with all dependencies."""
    configs: AppConfig = setup_configs()
    setup_map_tables()

    app: FastAPI = FastAPI(
        lifespan=lifespan,
        version=__version__,
        root_path="/api",
        debug=configs.asgi.fastapi_debug,
    )

    task_manager: AsyncBroker = setup_task_manager(
        taskiq_config=configs.taskiq,
        rabbitmq_config=configs.rabbit,
        redis_config=configs.redis,
    )

    setup_task_manager_tasks(task_manager)

    app.state.task_manager = task_manager

    context = {
        ASGIConfig: configs.asgi,
        SQLAlchemyConfig: configs.alchemy,
        PostgresConfig: configs.postgres,
        ChromaConfig: configs.chroma,
        OpenAIConfig: configs.openai,
        RedisConfig: configs.redis,
        AsyncBroker: task_manager,
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
