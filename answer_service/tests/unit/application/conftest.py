"""Shared fixtures for application layer unit tests."""

from __future__ import annotations

from collections import deque
from typing import TYPE_CHECKING, cast
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.factories.conversation_factory import (
    ConversationFactory,
)
from answer_service.domain.conversation.services.context_window_service import (
    ContextWindowService,
)
from answer_service.domain.conversation.value_objects.conversation_id import (
    ConversationId,
)
from answer_service.domain.conversation.value_objects.message_id import MessageId

if TYPE_CHECKING:
    from answer_service.application.common.ports.conversation_repository import (
        ConversationRepository,
    )
    from answer_service.application.common.ports.embedding_port import EmbeddingPort
    from answer_service.application.common.ports.event_bus import EventBus
    from answer_service.application.common.ports.llm_port import LLMPort
    from answer_service.application.common.ports.transaction_manager import (
        TransactionManager,
    )
    from answer_service.application.common.ports.user_repository import UserRepository
    from answer_service.application.common.ports.vector_search_port import (
        VectorSearchPort,
    )
    from answer_service.domain.conversation.ports.id_generator import (
        ConversationIdGenerator,
        MessageIdGenerator,
    )


@pytest.fixture()
def events_collection() -> EventsCollection:
    """Create an empty events collection for tests."""
    return EventsCollection(events=deque())


@pytest.fixture()
def transaction_manager() -> TransactionManager:
    """Create a mock transaction manager for tests."""
    return cast("TransactionManager", cast("object", AsyncMock()))


@pytest.fixture()
def event_bus() -> EventBus:
    """Create a mock event bus for tests."""
    return cast("EventBus", cast("object", AsyncMock()))


@pytest.fixture()
def user_repository() -> UserRepository:
    """Create a mock user repository for tests."""
    return cast("UserRepository", cast("object", AsyncMock()))


@pytest.fixture()
def conversation_repository() -> ConversationRepository:
    """Create a mock conversation repository for tests."""
    return cast("ConversationRepository", cast("object", AsyncMock()))


@pytest.fixture()
def embedding_port() -> EmbeddingPort:
    """Create a mock embedding port for tests."""
    return cast("EmbeddingPort", cast("object", AsyncMock()))


@pytest.fixture()
def vector_search_port() -> VectorSearchPort:
    """Create a mock vector search port for tests."""
    return cast("VectorSearchPort", cast("object", AsyncMock()))


@pytest.fixture()
def llm_port() -> LLMPort:
    """Create a mock LLM port for tests."""
    return cast("LLMPort", cast("object", AsyncMock()))


@pytest.fixture()
def context_window_service() -> ContextWindowService:
    """Create a mock context window service for tests."""
    return cast("ContextWindowService", MagicMock(spec=ContextWindowService))


@pytest.fixture()
def conversation_factory(events_collection: EventsCollection) -> ConversationFactory:
    """Create a conversation factory for tests."""
    conversation_id_generator = cast(
        "ConversationIdGenerator", MagicMock(return_value=ConversationId(uuid4()))
    )
    message_id_generator = cast(
        "MessageIdGenerator", MagicMock(return_value=MessageId(uuid4()))
    )
    return ConversationFactory(
        events_collection=events_collection,
        conversation_id_generator=conversation_id_generator,
        message_id_generator=message_id_generator,
    )
