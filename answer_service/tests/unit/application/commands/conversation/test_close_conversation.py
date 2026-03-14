from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from answer_service.application.commands.conversation.close_conversation import (
    CloseConversationCommand,
    CloseConversationCommandHandler,
)
from answer_service.application.common.ports.conversation_repository import (
    ConversationRepository,
)
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.errors import ConversationNotFoundError
from answer_service.domain.common.events_collection import EventsCollection
from tests.unit.factories.entities import make_conversation


@pytest.fixture()
def handler(
    transaction_manager: TransactionManager,
    conversation_repository: ConversationRepository,
    events_collection: EventsCollection,
    event_bus: EventBus,
) -> CloseConversationCommandHandler:
    return CloseConversationCommandHandler(
        transaction_manager=transaction_manager,
        conversation_repository=conversation_repository,
        events_collection=events_collection,
        event_bus=event_bus,
    )


async def test_close_conversation_closes_and_commits(
    handler: CloseConversationCommandHandler,
    conversation_repository: ConversationRepository,
    transaction_manager: TransactionManager,
    event_bus: EventBus,
) -> None:
    # Arrange
    conversation = make_conversation()
    conversation_repository.get_by_id = AsyncMock(return_value=conversation)
    command = CloseConversationCommand(conversation_id=uuid4())

    # Act
    await handler(command)

    # Assert
    conversation_repository.save.assert_awaited_once()
    transaction_manager.flush.assert_awaited_once()
    transaction_manager.commit.assert_awaited_once()
    event_bus.publish.assert_awaited_once()


async def test_close_conversation_raises_when_not_found(
    handler: CloseConversationCommandHandler,
    conversation_repository: ConversationRepository,
) -> None:
    # Arrange
    conversation_repository.get_by_id = AsyncMock(return_value=None)
    command = CloseConversationCommand(conversation_id=uuid4())

    # Act & Assert
    with pytest.raises(ConversationNotFoundError):
        await handler(command)
