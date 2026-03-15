from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from answer_service.application.commands.user.delete_user import (
    DeleteUserCommand,
    DeleteUserCommandHandler,
)
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.application.errors import UserNotFoundError
from tests.unit.factories.entities import make_user


@pytest.fixture()
def handler(
    transaction_manager: TransactionManager,
    user_repository: UserRepository,
    event_bus: EventBus,
) -> DeleteUserCommandHandler:
    return DeleteUserCommandHandler(
        transaction_manager=transaction_manager,
        user_repository=user_repository,
        event_bus=event_bus,
    )


async def test_delete_user_deletes_and_commits(
    handler: DeleteUserCommandHandler,
    user_repository: UserRepository,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange
    existing_user = make_user()
    user_repository.get_by_id = AsyncMock(return_value=existing_user)

    # Act
    await handler(DeleteUserCommand(user_id=existing_user.id))

    # Assert
    user_repository.delete.assert_awaited_once_with(existing_user.id)
    transaction_manager.flush.assert_awaited_once()
    transaction_manager.commit.assert_awaited_once()


async def test_delete_user_raises_when_not_found(
    handler: DeleteUserCommandHandler,
    user_repository: UserRepository,
) -> None:
    # Arrange
    user_repository.get_by_id = AsyncMock(return_value=None)

    # Act / Assert
    with pytest.raises(UserNotFoundError):
        await handler(DeleteUserCommand(user_id=uuid4()))
