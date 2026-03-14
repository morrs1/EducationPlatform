from typing import cast
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from answer_service.application.commands.conversation.ask_question import (
    AskQuestionCommand,
    AskQuestionCommandHandler,
)
from answer_service.application.common.ports.conversation_repository import (
    ConversationRepository,
)
from answer_service.application.common.ports.embedding_port import EmbeddingPort
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.llm_port import LLMPort, LLMResponse
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.ports.vector_search_port import VectorSearchPort
from answer_service.application.common.views.conversation_views import AnswerView
from answer_service.application.errors import ConversationNotFoundError
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.factories.conversation_factory import (
    ConversationFactory,
)
from answer_service.domain.conversation.services.context_window_service import (
    ContextWindowService,
)
from tests.unit.factories.entities import make_conversation


@pytest.fixture()
def handler(  # noqa: PLR0917
    transaction_manager: TransactionManager,
    conversation_repository: ConversationRepository,
    conversation_factory: ConversationFactory,
    context_window_service: ContextWindowService,
    embedding_port: EmbeddingPort,
    vector_search_port: VectorSearchPort,
    llm_port: LLMPort,
    events_collection: EventsCollection,
    event_bus: EventBus,
) -> AskQuestionCommandHandler:
    return AskQuestionCommandHandler(
        transaction_manager=transaction_manager,
        conversation_repository=conversation_repository,
        conversation_factory=conversation_factory,
        context_window_service=context_window_service,
        embedding_port=embedding_port,
        vector_search_port=vector_search_port,
        llm_port=llm_port,
        events_collection=events_collection,
        event_bus=event_bus,
    )


@pytest.fixture()
def llm_response() -> LLMResponse:
    return LLMResponse(
        content="42 is the answer.",
        model_name="gpt-4o",
        input_tokens=100,
        output_tokens=10,
    )


async def test_ask_question_returns_answer_view(  # noqa: PLR0917
    handler: AskQuestionCommandHandler,
    conversation_repository: ConversationRepository,
    embedding_port: EmbeddingPort,
    vector_search_port: VectorSearchPort,
    llm_port: LLMPort,
    context_window_service: ContextWindowService,
    llm_response: LLMResponse,
) -> None:
    # Arrange
    conversation = make_conversation()
    conversation_repository.get_by_id = AsyncMock(return_value=conversation)
    embedding_port.embed = AsyncMock(return_value=[0.1, 0.2, 0.3])
    vector_search_port.search = AsyncMock(return_value=[])
    llm_port.generate = AsyncMock(return_value=llm_response)
    cast("MagicMock", context_window_service).select_within_token_budget.return_value = []

    command = AskQuestionCommand(conversation_id=conversation.id, question="What is 42?")

    # Act
    result = await handler(command)

    # Assert
    assert isinstance(result, AnswerView)
    assert result.answer_content == llm_response.content
    assert result.model_name == llm_response.model_name


async def test_ask_question_raises_when_conversation_not_found(
    handler: AskQuestionCommandHandler,
    conversation_repository: ConversationRepository,
) -> None:
    # Arrange
    conversation_repository.get_by_id = AsyncMock(return_value=None)
    command = AskQuestionCommand(conversation_id=uuid4(), question="What is 42?")

    # Act / Assert
    with pytest.raises(ConversationNotFoundError):
        await handler(command)


async def test_ask_question_saves_and_commits(  # noqa: PLR0917
    handler: AskQuestionCommandHandler,
    conversation_repository: ConversationRepository,
    transaction_manager: TransactionManager,
    event_bus: EventBus,
    embedding_port: EmbeddingPort,
    vector_search_port: VectorSearchPort,
    llm_port: LLMPort,
    context_window_service: ContextWindowService,
    llm_response: LLMResponse,
) -> None:
    # Arrange
    conversation = make_conversation()
    conversation_repository.get_by_id = AsyncMock(return_value=conversation)
    embedding_port.embed = AsyncMock(return_value=[0.1])
    vector_search_port.search = AsyncMock(return_value=[])
    llm_port.generate = AsyncMock(return_value=llm_response)
    cast("MagicMock", context_window_service).select_within_token_budget.return_value = []

    command = AskQuestionCommand(conversation_id=conversation.id, question="Question?")

    # Act
    await handler(command)

    # Assert
    conversation_repository.save.assert_awaited_once()
    transaction_manager.flush.assert_awaited_once()
    transaction_manager.commit.assert_awaited_once()
    event_bus.publish.assert_awaited_once()
