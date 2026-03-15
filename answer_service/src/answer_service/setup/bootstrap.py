import logging
import sys
from functools import lru_cache
from types import TracebackType
from typing import Final

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from faststream.rabbit import RabbitBroker
from taskiq import AsyncBroker, ScheduleSource, TaskiqScheduler, async_shared_broker
from taskiq.middlewares import SmartRetryMiddleware
from taskiq.schedule_sources.label_based import LabelScheduleSource
from taskiq_aio_pika import AioPikaBroker
from taskiq_redis import ListRedisScheduleSource, RedisAsyncResultBackend

from answer_service.infrastructure.persistence.models import (
    map_conversations_tables,
    map_lesson_index_tables,
    map_outbox_table,
    map_users_table,
)
from answer_service.infrastructure.scheduler.tasks.lesson_index_tasks import (
    setup_lesson_index_tasks,
)
from answer_service.infrastructure.scheduler.tasks.outbox_tasks import setup_outbox_tasks
from answer_service.presentation.http.v1.common.exception_handler import (
    setup_exception_handlers,
)
from answer_service.presentation.http.v1.common.routes.healthcheck import (
    healthcheck_router,
)
from answer_service.presentation.http.v1.common.routes.index import index_router
from answer_service.presentation.http.v1.middlewares.logging import LoggingMiddleware
from answer_service.presentation.http.v1.routes.conversation import conversation_router
from answer_service.presentation.http.v1.routes.lesson_index import lesson_router
from answer_service.presentation.http.v1.routes.user import user_router
from answer_service.presentation.rabbitmq.v1 import (
    lesson_index_rabbit_router,
    user_rabbit_router,
)
from answer_service.setup.configs.app_config import AppConfig
from answer_service.setup.configs.asgi_config import ASGIConfig
from answer_service.setup.configs.broker_config import RabbitConfig
from answer_service.setup.configs.logging_config import LoggingConfig, configure_logging
from answer_service.setup.configs.redis_config import RedisConfig
from answer_service.setup.configs.taskiq_config import TaskIQConfig

logger: Final[logging.Logger] = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def setup_configs() -> AppConfig:
    return AppConfig()


def setup_map_tables() -> None:
    """Ensures imperative SQLAlchemy mappings are initialized at application startup.

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
    map_outbox_table()


def setup_task_manager(
    taskiq_config: TaskIQConfig,
    rabbitmq_config: RabbitConfig,
    redis_config: RedisConfig,
) -> AsyncBroker:
    """Create and configure the taskiq AioPika broker with Redis result backend."""
    logger.debug("Creating taskiq broker...")
    broker: AsyncBroker = AioPikaBroker(
        url=rabbitmq_config.uri,
        declare_exchange=taskiq_config.declare_exchange,
        declare_queues_kwargs={"durable": taskiq_config.durable_queue},
        declare_exchange_kwargs={"durable": taskiq_config.durable_exchange},
    ).with_result_backend(
        RedisAsyncResultBackend(
            redis_url=redis_config.worker_uri,
            result_ex_time=1000,
        )
    )
    async_shared_broker.default_broker(broker)
    logger.debug("Taskiq broker created and set as default")
    return broker


def setup_task_manager_middlewares(
    broker: AsyncBroker,
    taskiq_config: TaskIQConfig,
) -> AsyncBroker:
    """Apply retry middleware to the taskiq broker."""
    return broker.with_middlewares(
        SmartRetryMiddleware(
            default_retry_count=taskiq_config.default_retry_count,
            default_delay=taskiq_config.default_delay,
            use_jitter=taskiq_config.use_jitter,
            use_delay_exponent=taskiq_config.use_delay_exponent,
            max_delay_exponent=taskiq_config.max_delay_component,
        ),
    )


def setup_task_manager_tasks(broker: AsyncBroker) -> None:
    """Register all taskiq tasks with the broker."""
    setup_outbox_tasks(broker)
    setup_lesson_index_tasks(broker)


def setup_schedule_source(redis_config: RedisConfig) -> ScheduleSource:
    """Create a Redis-backed schedule source for the taskiq scheduler."""
    return ListRedisScheduleSource(url=redis_config.schedule_source_uri)


def setup_scheduler(
    broker: AsyncBroker,
    schedule_source: ScheduleSource,
) -> TaskiqScheduler:
    """Create the taskiq scheduler with label + Redis schedule sources."""
    logger.debug("Creating taskiq scheduler...")
    return TaskiqScheduler(
        broker=broker,
        sources=[
            LabelScheduleSource(broker),
            schedule_source,
        ],
    )


def setup_rabbit_broker(rabbit_config: RabbitConfig) -> RabbitBroker:
    """Create a FastStream RabbitMQ broker (not yet started)."""
    return RabbitBroker(rabbit_config.uri)


def setup_rabbit_routes(broker: RabbitBroker) -> None:
    """Include all FastStream RabbitMQ routers into the broker."""
    broker.include_router(lesson_index_rabbit_router)
    broker.include_router(user_rabbit_router)


def setup_http_routes(app: FastAPI, /) -> None:
    """Registers all routers for FastAPI application.

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
    """Registers all middlewares for FastAPI application.

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
