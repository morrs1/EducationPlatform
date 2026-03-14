import logging
import sys
from types import TracebackType
from functools import lru_cache
from fastapi import FastAPI, APIRouter

from answer_service.infrastructure.persistence.models import (
    map_users_table,
    map_conversations_tables,
    map_lesson_index_tables
)
from answer_service.setup.configs.app_config import AppConfig
from answer_service.setup.configs.asgi_config import ASGIConfig
from answer_service.setup.configs.logging_config import LoggingConfig, configure_logging
from answer_service.presentation.http.v1.middlewares.logging import LoggingMiddleware
from fastapi.middleware.cors import CORSMiddleware
from answer_service.presentation.http.v1.common.exception_handler import setup_exception_handlers
from answer_service.presentation.http.v1.common.routes.healthcheck import healthcheck_router
from answer_service.presentation.http.v1.common.routes.index import index_router
from answer_service.presentation.http.v1.routes.conversation import conversation_router
from answer_service.presentation.http.v1.routes.lesson_index import lesson_router
from answer_service.presentation.http.v1.routes.user import user_router

@lru_cache(maxsize=1)
def setup_configs() -> AppConfig:
    return AppConfig()


def setup_map_tables() -> None:
    """
    Ensures imperative SQLAlchemy mappings are initialized at application startup.

    ### Purpose:
    In Clean Architecture, domain entities remain agnostic of database
    mappings. To integrate with SQLAlchemy, mappings must be explicitly
    triggered to link ORM attributes to domain classes. Without this setup,
    attempts to interact with unmapped entities in database operations
    will lead to runtime errors.

    ### Solution:
    This function provides a single entry point to initialize the mapping
    of domain entities to database tables. By calling the `setup_map_tables` function,
    ORM attributes are linked to domain classes without altering domain code
    or introducing infrastructure concerns.

    ### Usage:
    Call the `setup_map_tables` function in the application factory to initialize
    mappings at startup. Additionally, it is necessary to call this function
    in `env.py` for Alembic migrations to ensure all models are available
    during database migrations.
    """
    map_users_table()
    map_conversations_tables()
    map_lesson_index_tables()

def setup_http_routes(app: FastAPI, /) -> None:
    """
    Registers all routers for FastAPI application

    Args:
        app: FastAPI application

    Returns:
        None
    """
    app.include_router(index_router)
    app.include_router(healthcheck_router)

    router_v1: APIRouter = APIRouter(prefix="/v1")
    router_v1.include_router(user_router)
    router_v1.include_router(conversation_router)
    router_v1.include_router(lesson_router)
    app.include_router(router_v1)


def setup_http_exc_handlers(app: FastAPI) -> None:
    setup_exception_handlers(app)

def setup_http_middlewares(app: FastAPI, /, api_config: ASGIConfig) -> None:
    """
    Registers all middlewares for FastAPI application.

    Args:
        app: FastAPI application
        api_config: ASGIConfig
    Returns:
        None
    """
    app.add_middleware(
        CORSMiddleware,  # type: ignore[arg-type, unused-ignore]
        allow_origins=[
            f"http://localhost:{api_config.port}",
            f"https://{api_config.host}:{api_config.port}",
            f"http://127.0.0.1:{api_config.port}",
            "http://127.0.0.1",
        ],
        allow_credentials=api_config.allow_credentials,
        allow_methods=api_config.allow_methods,
        allow_headers=api_config.allow_headers,
    )
    app.add_middleware(LoggingMiddleware)  # type: ignore[arg-type, unused-ignore]

def setup_logging(logger_config: LoggingConfig) -> None:
    configure_logging(logger_config)

    root_logger: logging.Logger = logging.getLogger()

    if logger_config.level == "DEBUG":
        sys.excepthook = global_exception_handler_with_traceback
    else:
        sys.excepthook = global_exception_handler_without_traceback

    root_logger.info("Logger configured")


def global_exception_handler_with_traceback(
    exc_type: type[BaseException],
    value: BaseException,
    traceback: TracebackType | None,
) -> None:
    root_logger: logging.Logger = logging.getLogger()
    root_logger.error("Error", exc_info=(exc_type, value, traceback))


def global_exception_handler_without_traceback(
    exc_type: type[BaseException],
    value: BaseException,
    _traceback: TracebackType | None,
) -> None:
    root_logger: logging.Logger = logging.getLogger()
    root_logger.error("Error: %s %s", exc_type.__name__, value)
