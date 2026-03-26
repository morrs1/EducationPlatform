from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from answer_service.application.common.ports.conversation_repository import (
    ConversationRepository,
)
from answer_service.application.common.views.conversation_views import ConversationView
from answer_service.application.errors import ConversationNotFoundError
from answer_service.application.queries.conversation.get_conversation import (
    GetConversationQuery,
    GetConversationQueryHandler,
)
from tests.unit.factories.entities import make_conversation


@pytest.fixture()
def handler(
    conversation_repository: ConversationRepository,
) -> GetConversationQueryHandler:
    return GetConversationQueryHandler(
        conversation_repository=conversation_repository,
    )


async def test_get_conversation_returns_view(
    handler: GetConversationQueryHandler,
    conversation_repository: ConversationRepository,
) -> None:
    # Arrange
    conversation = make_conversation()
    conversation_repository.get_by_id = AsyncMock(return_value=conversation)
    query = GetConversationQuery(conversation_id=uuid4())

    # Act
    result = await handler(query)

    # Assert
    assert isinstance(result, ConversationView)
    assert result.conversation_id == conversation.id


async def test_get_conversation_raises_when_not_found(
    handler: GetConversationQueryHandler,
    conversation_repository: ConversationRepository,
) -> None:
    # Arrange
    conversation_repository.get_by_id = AsyncMock(return_value=None)
    query = GetConversationQuery(conversation_id=uuid4())

    # Act & Assert
    with pytest.raises(ConversationNotFoundError):
        await handler(query)
