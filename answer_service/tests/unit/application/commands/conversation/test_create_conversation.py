from uuid import uuid4

import pytest

from answer_service.application.commands.conversation.create_conversation import (
    CreateConversationCommand,
    CreateConversationCommandHandler,
)
from answer_service.application.common.ports.conversation_repository import (
    ConversationRepository,
)
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.views.conversation_views import (
    ConversationCreatedView,
)
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.factories.conversation_factory import (
    ConversationFactory,
)


@pytest.fixture()
def handler(
    transaction_manager: TransactionManager,
    conversation_repository: ConversationRepository,
    conversation_factory: ConversationFactory,
    events_collection: EventsCollection,
    event_bus: EventBus,
) -> CreateConversationCommandHandler:
    return CreateConversationCommandHandler(
        transaction_manager=transaction_manager,
        conversation_repository=conversation_repository,
        conversation_factory=conversation_factory,
        events_collection=events_collection,
        event_bus=event_bus,
    )


async def test_create_conversation_returns_view(
    handler: CreateConversationCommandHandler,
) -> None:
    # Arrange
    command = CreateConversationCommand(user_id=uuid4(), lesson_id=uuid4())

    # Act
    result = await handler(command)

    # Assert
    assert isinstance(result, ConversationCreatedView)


async def test_create_conversation_saves_and_commits(
    handler: CreateConversationCommandHandler,
    conversation_repository: ConversationRepository,
    transaction_manager: TransactionManager,
    event_bus: EventBus,
) -> None:
    # Arrange
    command = CreateConversationCommand(user_id=uuid4(), lesson_id=uuid4())

    # Act
    await handler(command)

    # Assert
    conversation_repository.save.assert_awaited_once()  # type: ignore[attr-defined]
    transaction_manager.flush.assert_awaited_once()  # type: ignore[attr-defined]
    transaction_manager.commit.assert_awaited_once()  # type: ignore[attr-defined]
    event_bus.publish.assert_awaited_once()  # type: ignore[attr-defined]
