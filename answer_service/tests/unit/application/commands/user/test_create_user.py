from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from answer_service.application.commands.user.create_user import (
    CreateUserCommand,
    CreateUserCommandHandler,
)
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.domain.common.events_collection import EventsCollection
from tests.unit.factories.entities import make_user


@pytest.fixture()
def handler(
    transaction_manager: TransactionManager,
    user_repository: UserRepository,
    events_collection: EventsCollection,
    event_bus: EventBus,
) -> CreateUserCommandHandler:
    return CreateUserCommandHandler(
        transaction_manager=transaction_manager,
        user_repository=user_repository,
        events_collection=events_collection,
        event_bus=event_bus,
    )


async def test_create_user_saves_and_commits(
    handler: CreateUserCommandHandler,
    user_repository: UserRepository,
    transaction_manager: TransactionManager,
    event_bus: EventBus,
) -> None:
    # Arrange
    user_id = uuid4()
    user_repository.get_by_id = AsyncMock(return_value=None)

    # Act
    await handler(CreateUserCommand(user_id=user_id))

    # Assert
    user_repository.save.assert_awaited_once()
    transaction_manager.flush.assert_awaited_once()
    transaction_manager.commit.assert_awaited_once()
    event_bus.publish.assert_awaited_once()


async def test_create_user_skips_if_already_exists(
    handler: CreateUserCommandHandler,
    user_repository: UserRepository,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange
    existing_user = make_user()
    user_repository.get_by_id = AsyncMock(return_value=existing_user)

    # Act
    await handler(CreateUserCommand(user_id=existing_user.id))

    # Assert
    user_repository.save.assert_not_awaited()
    transaction_manager.commit.assert_not_awaited()
