"""Integration tests for RabbitMQ lesson_index subscribers.

ScheduleIndex/ReindexLessonCommandHandler only calls TaskScheduler.schedule()
(no-op stub in tests), so there are no DB side-effects to assert against.
Tests verify that the broker routes messages to the correct handler and that
the handler does not propagate errors to the caller (i.e. ack/nack is handled
internally).
"""

from uuid import uuid4

import pytest
from faststream.rabbit import RabbitBroker

from answer_service.presentation.rabbitmq.v1.lesson_index.handlers import (
    on_lesson_created,
    on_lesson_updated,
)

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def test_on_lesson_created_handler_is_invoked(
    lesson_index_test_broker: RabbitBroker,
) -> None:
    # Arrange
    lesson_id = uuid4()

    # Act
    await lesson_index_test_broker.publish(
        {
            "lesson_id": str(lesson_id),
            "title": "Python Basics",
            "content": "Python is a high-level programming language.",
        },
        routing_key="lesson.created",
    )

    # Assert — handler was reached and processed the message
    on_lesson_created.mock.assert_called_once()


async def test_on_lesson_created_passes_correct_lesson_id(
    lesson_index_test_broker: RabbitBroker,
) -> None:
    # Arrange
    lesson_id = uuid4()

    # Act
    await lesson_index_test_broker.publish(
        {
            "lesson_id": str(lesson_id),
            "title": "Advanced Python",
            "content": "Decorators and metaclasses.",
        },
        routing_key="lesson.created",
    )

    # Assert — parsed message carried the correct lesson_id
    call_args = on_lesson_created.mock.call_args
    assert call_args is not None
    received_message = call_args.args[0]
    assert received_message.lesson_id == lesson_id


async def test_on_lesson_updated_handler_is_invoked(
    lesson_index_test_broker: RabbitBroker,
) -> None:
    # Arrange
    lesson_id = uuid4()

    # Act
    await lesson_index_test_broker.publish(
        {
            "lesson_id": str(lesson_id),
            "new_title": "Updated Title",
            "new_content": "Updated lesson content about Python.",
        },
        routing_key="lesson.updated",
    )

    # Assert — handler was reached
    on_lesson_updated.mock.assert_called_once()


async def test_on_lesson_updated_passes_correct_lesson_id(
    lesson_index_test_broker: RabbitBroker,
) -> None:
    # Arrange
    lesson_id = uuid4()

    # Act
    await lesson_index_test_broker.publish(
        {
            "lesson_id": str(lesson_id),
            "new_content": "Revised content.",
        },
        routing_key="lesson.updated",
    )

    # Assert — parsed message carried the correct lesson_id
    call_args = on_lesson_updated.mock.call_args
    assert call_args is not None
    received_message = call_args.args[0]
    assert received_message.lesson_id == lesson_id
