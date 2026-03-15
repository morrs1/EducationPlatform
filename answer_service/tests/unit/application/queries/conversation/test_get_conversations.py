from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from answer_service.application.common.ports.conversation_repository import (
    ConversationRepository,
)
from answer_service.application.common.views.conversation_views import (
    ConversationListItemView,
)
from answer_service.application.queries.conversation.get_conversations import (
    GetConversationsQuery,
    GetConversationsQueryHandler,
)
from tests.unit.factories.entities import make_conversation


@pytest.fixture()
def handler(
    conversation_repository: ConversationRepository,
) -> GetConversationsQueryHandler:
    return GetConversationsQueryHandler(conversation_repository=conversation_repository)


async def test_get_conversations_returns_list_of_views(
    handler: GetConversationsQueryHandler,
    conversation_repository: ConversationRepository,
) -> None:
    # Arrange
    user_id = uuid4()
    conversations = [make_conversation(), make_conversation()]
    conversation_repository.get_all_by_user = AsyncMock(return_value=conversations)

    # Act
    result = await handler(GetConversationsQuery(user_id=user_id))

    # Assert
    assert len(result) == 2
    assert all(isinstance(v, ConversationListItemView) for v in result)


async def test_get_conversations_returns_empty_list_when_none(
    handler: GetConversationsQueryHandler,
    conversation_repository: ConversationRepository,
) -> None:
    # Arrange
    conversation_repository.get_all_by_user = AsyncMock(return_value=[])

    # Act
    result = await handler(GetConversationsQuery(user_id=uuid4()))

    # Assert
    assert result == []
