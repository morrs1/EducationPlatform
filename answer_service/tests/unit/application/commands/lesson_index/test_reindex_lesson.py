from typing import cast
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from answer_service.application.commands.lesson_index.reindex_lesson import (
    ReindexLessonCommand,
    ReindexLessonCommandHandler,
)
from answer_service.application.common.ports.embedding_port import EmbeddingPort
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.lesson_index_repository import (
    LessonIndexRepository,
)
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.ports.vector_search_port import VectorSearchPort
from answer_service.application.errors import LessonIndexNotFoundError
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
    lesson_index_factory: LessonIndexFactory,
    embedding_port: EmbeddingPort,
    vector_search_port: VectorSearchPort,
    events_collection: EventsCollection,
    event_bus: EventBus,
) -> ReindexLessonCommandHandler:
    text_splitter_service = cast(
        "TextSplitterService", MagicMock(spec=TextSplitterService)
    )
    return ReindexLessonCommandHandler(
        transaction_manager=transaction_manager,
        lesson_index_repository=lesson_index_repository,
        lesson_index_factory=lesson_index_factory,
        text_splitter_service=text_splitter_service,
        embedding_port=embedding_port,
        vector_search_port=vector_search_port,
        events_collection=events_collection,
        event_bus=event_bus,
    )


async def test_reindex_lesson_raises_when_not_found(
    handler: ReindexLessonCommandHandler,
    lesson_index_repository: LessonIndexRepository,
) -> None:
    # Arrange
    lesson_index_repository.get_by_lesson_id = AsyncMock(return_value=None)
    command = ReindexLessonCommand(lesson_id=uuid4(), new_content="New content")

    # Act & Assert
    with pytest.raises(LessonIndexNotFoundError):
        await handler(command)


async def test_reindex_lesson_saves_and_commits(  # noqa: PLR0917
    handler: ReindexLessonCommandHandler,
    lesson_index_repository: LessonIndexRepository,
    transaction_manager: TransactionManager,
    vector_search_port: VectorSearchPort,
    embedding_port: EmbeddingPort,
    event_bus: EventBus,
) -> None:
    # Arrange
    lesson_index = make_lesson_index()
    lesson_index.start_indexing()
    lesson_index.mark_indexed()
    lesson_index_repository.get_by_lesson_id = AsyncMock(return_value=lesson_index)
    handler._text_splitter_service.split = MagicMock(
        return_value=[ChunkContent(content="new content")]
    )
    embedding_port.embed_many = AsyncMock(return_value=[[0.3, 0.4]])
    vector_search_port.delete_by_lesson = AsyncMock()
    command = ReindexLessonCommand(lesson_id=uuid4(), new_content="new content")

    # Act
    await handler(command)

    # Assert
    lesson_index_repository.save.assert_awaited_once()
    transaction_manager.flush.assert_awaited_once()
    transaction_manager.commit.assert_awaited_once()
    vector_search_port.delete_by_lesson.assert_awaited_once()
    event_bus.publish.assert_awaited_once()
