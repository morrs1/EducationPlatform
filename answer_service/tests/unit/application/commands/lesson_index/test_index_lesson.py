from typing import cast
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from answer_service.application.commands.lesson_index.index_lesson import (
    IndexLessonCommand,
    IndexLessonCommandHandler,
)
from answer_service.application.common.ports.embedding_port import EmbeddingPort
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.lesson_index_repository import (
    LessonIndexRepository,
)
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.ports.vector_search_port import VectorSearchPort
from answer_service.application.errors import LessonAlreadyIndexedError
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.lesson_index.factories.lesson_index_factory import (
    LessonIndexFactory,
)
from answer_service.domain.lesson_index.services.text_splitter_service import (
    TextSplitterService,
)
from answer_service.domain.lesson_index.value_objects.chunk_content import ChunkContent
from tests.unit.factories.entities import make_lesson_index


@pytest.fixture()
def handler(  # noqa: PLR0917
    transaction_manager: TransactionManager,
    lesson_index_repository: LessonIndexRepository,
    vector_search_port: VectorSearchPort,
    lesson_index_factory: LessonIndexFactory,
    embedding_port: EmbeddingPort,
    events_collection: EventsCollection,
    event_bus: EventBus,
) -> IndexLessonCommandHandler:
    text_splitter_service = cast(
        "TextSplitterService", MagicMock(spec=TextSplitterService)
    )
    return IndexLessonCommandHandler(
        transaction_manager=transaction_manager,
        lesson_index_repository=lesson_index_repository,
        vector_search_port=vector_search_port,
        lesson_index_factory=lesson_index_factory,
        text_splitter_service=text_splitter_service,
        embedding_port=embedding_port,
        events_collection=events_collection,
        event_bus=event_bus,
    )


async def test_index_lesson_raises_when_already_indexed(
    handler: IndexLessonCommandHandler,
    lesson_index_repository: LessonIndexRepository,
) -> None:
    # Arrange
    lesson_index = make_lesson_index()
    lesson_index_repository.get_by_lesson_id = AsyncMock(return_value=lesson_index)
    command = IndexLessonCommand(lesson_id=uuid4(), title="Lesson", content="Content")

    # Act & Assert
    with pytest.raises(LessonAlreadyIndexedError):
        await handler(command)


async def test_index_lesson_saves_and_commits(  # noqa: PLR0917
    handler: IndexLessonCommandHandler,
    lesson_index_repository: LessonIndexRepository,
    transaction_manager: TransactionManager,
    vector_search_port: VectorSearchPort,
    embedding_port: EmbeddingPort,
    event_bus: EventBus,
) -> None:
    # Arrange
    lesson_index_repository.get_by_lesson_id = AsyncMock(return_value=None)
    handler._text_splitter_service.split = MagicMock(
        return_value=[ChunkContent(content="hello")]
    )
    embedding_port.embed_many = AsyncMock(return_value=[[0.1, 0.2]])
    command = IndexLessonCommand(lesson_id=uuid4(), title="Lesson", content="hello")

    # Act
    await handler(command)

    # Assert
    lesson_index_repository.save.assert_awaited_once()
    transaction_manager.flush.assert_awaited_once()
    transaction_manager.commit.assert_awaited_once()
    vector_search_port.upsert_chunks.assert_awaited_once()
    event_bus.publish.assert_awaited_once()
