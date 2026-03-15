"""Shared broker fixtures for RabbitMQ presentation integration tests."""

from collections.abc import AsyncGenerator

import pytest
from dishka import AsyncContainer
from dishka_faststream import setup_dishka as setup_faststream_dishka
from faststream.rabbit import RabbitBroker, TestRabbitBroker

from answer_service.presentation.rabbitmq.v1.routes.lesson_index.handlers import (
    lesson_index_rabbit_router,
)
from answer_service.presentation.rabbitmq.v1.routes.user.handlers import (
    user_rabbit_router,
)


@pytest.fixture()
async def lesson_index_test_broker(
    dishka_container: AsyncContainer,
) -> AsyncGenerator[RabbitBroker, None]:
    """In-memory broker with lesson_index routes and Dishka wired."""
    broker = RabbitBroker()
    broker.include_router(lesson_index_rabbit_router)
    setup_faststream_dishka(dishka_container, broker=broker)
    async with TestRabbitBroker(broker) as tb:
        yield tb


@pytest.fixture()
async def user_test_broker(
    dishka_container: AsyncContainer,
) -> AsyncGenerator[RabbitBroker, None]:
    """In-memory broker with user routes and Dishka wired."""
    broker = RabbitBroker()
    broker.include_router(user_rabbit_router)
    setup_faststream_dishka(dishka_container, broker=broker)
    async with TestRabbitBroker(broker) as tb:
        yield tb
