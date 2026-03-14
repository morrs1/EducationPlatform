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
from answer_service._version import __version__

from answer_service.setup.bootstrap import (
    setup_configs,
    setup_exc_handlers,
    setup_http_middlewares,
    setup_http_routes,
    setup_map_tables,
)
from answer_service.setup.configs.asgi_config import ASGIConfig
from answer_service.setup.configs.database_config import PostgresConfig, SQLAlchemyConfig
from answer_service.setup.ioc import setup_providers

if TYPE_CHECKING:
    from answer_service.setup.configs.settings import AppConfig

logger: Final[logging.Logger] = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Async context manager for FastAPI application lifecycle management.

    Handles the startup and shutdown events of the FastAPI application.
    Specifically ensures proper cleanup
        of Dishka container resources on shutdown.

    Args:
        app: FastAPI application instance. Positional-only parameter.

    Yields:
        None: Indicates successful entry into the context.

    Note:
        The actual resource cleanup (Dishka container closure)
            happens after yield, during the application shutdown phase.
    """

    yield

    clear_mappers()
    await cast("AsyncContainer", app.state.dishka_container).close()


def create_fastapi_app() -> FastAPI:  # pragma: no cover
    """Creates and configures a FastAPI application
        instance with all dependencies.

    Performs comprehensive application setup including:
    - Configuration initialization
    - Dependency injection container setup
    - Database mapping
    - Route registration
    - Exception handlers
    - Middleware stack
    - Dishka integration

    Returns:
        FastAPI: Fully configured application instance ready for use.

    Side Effects:
        - Configures global application state
        - Initializes database mappings
        - Sets up observability tools
        - Registers all route handlers
    """
    configs: AppConfig = setup_configs()
    setup_map_tables()

    app: FastAPI = FastAPI(
        lifespan=lifespan,
        version=__version__,
        root_path="/api",
        debug=configs.asgi.fastapi_debug,
    )

    context = {
        ASGIConfig: configs.asgi,
        SQLAlchemyConfig: configs.alchemy,
        PostgresConfig: configs.postgres,
    }

    container: AsyncContainer = make_async_container(*setup_providers(), context=context)
    setup_http_routes(app)
    setup_exc_handlers(app)
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