"""Taskiq scheduler entry point.

Run with:
    taskiq scheduler answer_service.scheduler:scheduler
"""
import logging
from typing import Final

from taskiq import AsyncBroker, ScheduleSource, TaskiqScheduler

from answer_service.setup.bootstrap import setup_schedule_source, setup_scheduler
from answer_service.setup.configs.app_config import AppConfig
from answer_service.worker import create_worker_taskiq_app

logger: Final[logging.Logger] = logging.getLogger(__name__)


def create_scheduler_taskiq_app() -> TaskiqScheduler:
    """Create and configure the taskiq scheduler application."""
    configs: AppConfig = AppConfig()
    worker_broker: AsyncBroker = create_worker_taskiq_app()
    schedule_source: ScheduleSource = setup_schedule_source(configs.redis)
    taskiq_scheduler: TaskiqScheduler = setup_scheduler(
        broker=worker_broker,
        schedule_source=schedule_source,
    )
    return taskiq_scheduler
