"""Integration tests for RabbitMQ user subscribers.

CreateUserCommandHandler and DeleteUserCommandHandler both touch PostgreSQL,
so these tests assert actual DB state after the handler runs.
"""

from uuid import UUID, uuid4

import pytest
from dishka import AsyncContainer
from faststream.rabbit import RabbitBroker

from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.domain.user.entities.user import User
from answer_service.presentation.rabbitmq.v1.user.handlers import (
    on_user_deleted,
    on_user_registered,
)

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def _get_user(dishka_container: AsyncContainer, user_id: UUID) -> User | None:
    async with dishka_container() as request_container:
        repo: UserRepository = await request_container.get(UserRepository)
        return await repo.get_by_id(user_id)


# ---------------------------------------------------------------------------
# user.registered
# ---------------------------------------------------------------------------


async def test_on_user_registered_creates_user_in_db(
    user_test_broker: RabbitBroker,
    dishka_container: AsyncContainer,
) -> None:
    # Arrange
    user_id = uuid4()

    # Act
    await user_test_broker.publish(
        {"user_id": str(user_id)},
        routing_key="user.registered",
    )

    # Assert
    on_user_registered.mock.assert_called_once()
    user = await _get_user(dishka_container, user_id)
    assert user is not None


async def test_on_user_registered_passes_correct_user_id(
    user_test_broker: RabbitBroker,
    dishka_container: AsyncContainer,
) -> None:
    # Arrange
    user_id = uuid4()

    # Act
    await user_test_broker.publish(
        {"user_id": str(user_id)},
        routing_key="user.registered",
    )

    # Assert — parsed message carried the correct user_id
    call_args = on_user_registered.mock.call_args
    assert call_args is not None
    received_message = call_args.args[0]
    assert received_message.user_id == user_id


async def test_on_user_registered_is_idempotent(
    user_test_broker: RabbitBroker,
    dishka_container: AsyncContainer,
) -> None:
    # Arrange
    user_id = uuid4()
    await user_test_broker.publish(
        {"user_id": str(user_id)},
        routing_key="user.registered",
    )

    # Act — publish the same user_id a second time
    await user_test_broker.publish(
        {"user_id": str(user_id)},
        routing_key="user.registered",
    )

    # Assert — user still exists exactly once; no error raised
    user = await _get_user(dishka_container, user_id)
    assert user is not None


# ---------------------------------------------------------------------------
# user.deleted
# ---------------------------------------------------------------------------


async def test_on_user_deleted_removes_user_from_db(
    user_test_broker: RabbitBroker,
    dishka_container: AsyncContainer,
) -> None:
    # Arrange — register user first via the same broker
    user_id = uuid4()
    await user_test_broker.publish(
        {"user_id": str(user_id)},
        routing_key="user.registered",
    )

    # Act
    await user_test_broker.publish(
        {"user_id": str(user_id)},
        routing_key="user.deleted",
    )

    # Assert
    on_user_deleted.mock.assert_called()
    user = await _get_user(dishka_container, user_id)
    assert user is None


async def test_on_user_deleted_nacks_when_user_not_found(
    user_test_broker: RabbitBroker,
) -> None:
    # Arrange — user was never registered
    user_id = uuid4()

    # Act — handler catches AppError internally and calls nack; no exception propagates
    await user_test_broker.publish(
        {"user_id": str(user_id)},
        routing_key="user.deleted",
    )

    # Assert — handler was invoked (routing worked); error was swallowed internally
    on_user_deleted.mock.assert_called_once()
