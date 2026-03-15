"""Tests for LessonIndex aggregate."""

from collections import deque
from uuid import uuid4

import pytest

from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.lesson_index.entities.document_chunk import DocumentChunk
from answer_service.domain.lesson_index.entities.lesson_index import LessonIndex
from answer_service.domain.lesson_index.errors import (
    LessonAlreadyIndexingError,
    LessonNotInIndexingStateError,
)
from answer_service.domain.lesson_index.events import (
    LessonIndexed,
    LessonIndexingFailed,
    LessonIndexingRequested,
    LessonReindexRequested,
)
from answer_service.domain.lesson_index.value_objects.chunk_content import ChunkContent
from answer_service.domain.lesson_index.value_objects.chunk_id import ChunkId
from answer_service.domain.lesson_index.value_objects.embedding import Embedding
from answer_service.domain.lesson_index.value_objects.index_status import IndexStatus
from answer_service.domain.lesson_index.value_objects.lesson_id import LessonId


class TestLessonIndexCreation:
    """Tests for LessonIndex.create() method."""

    def test_create_lesson_index(self) -> None:
        # Arrange
        lesson_id = LessonId(uuid4())
        title = "Test Lesson"
        events_collection = EventsCollection(events=deque())

        # Act
        sut = LessonIndex.create(
            lesson_id=lesson_id,
            title=title,
            events_collection=events_collection,
        )

        # Assert
        assert sut.id == lesson_id
        assert sut.title == title
        assert sut.chunks == []
        assert sut.status == IndexStatus.PENDING

    def test_create_lesson_index_emits_event(self) -> None:
        # Arrange
        lesson_id = LessonId(uuid4())
        title = "Test Lesson"
        events_collection = EventsCollection(events=deque())

        # Act
        LessonIndex.create(
            lesson_id=lesson_id,
            title=title,
            events_collection=events_collection,
        )

        # Assert
        assert len(events_collection.events) == 1
        event = events_collection.events[0]
        assert isinstance(event, LessonIndexingRequested)
        assert event.lesson_id == lesson_id
        assert event.title == title


class TestLessonIndexStartIndexing:
    """Tests for LessonIndex.start_indexing() method."""

    def test_start_indexing_from_pending(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )

        # Act
        sut.start_indexing()

        # Assert
        assert sut.status == IndexStatus.INDEXING

    def test_start_indexing_from_indexing(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()

        # Act
        sut.start_indexing()

        # Assert
        assert sut.status == IndexStatus.INDEXING  # Can call multiple times

    def test_start_indexing_from_ready(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()
        sut.mark_indexed()

        # Act
        sut.start_indexing()

        # Assert
        assert sut.status == IndexStatus.INDEXING  # Can re-index

    def test_start_indexing_from_failed(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()
        sut.mark_failed("Error")

        # Act
        sut.start_indexing()

        # Assert
        assert sut.status == IndexStatus.INDEXING  # Can retry after failure


class TestLessonIndexAddChunk:
    """Tests for LessonIndex.add_chunk() method."""

    def test_add_chunk_in_indexing_state(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()
        chunk = DocumentChunk(
            id=ChunkId(uuid4()),
            content=ChunkContent(content="Chunk content"),
            embedding=Embedding(vector=(0.1, 0.2, 0.3)),
            position=0,
        )

        # Act
        sut.add_chunk(chunk)

        # Assert
        assert len(sut.chunks) == 1
        assert sut.chunks[0] == chunk

    def test_add_chunk_not_in_indexing_state_raises(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        chunk = DocumentChunk(
            id=ChunkId(uuid4()),
            content=ChunkContent(content="Chunk content"),
            embedding=Embedding(vector=(0.1, 0.2, 0.3)),
            position=0,
        )

        # Act & Assert
        with pytest.raises(LessonNotInIndexingStateError):
            sut.add_chunk(chunk)

    def test_add_multiple_chunks(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()
        chunk1 = DocumentChunk(
            id=ChunkId(uuid4()),
            content=ChunkContent(content="Chunk 1"),
            embedding=Embedding(vector=(0.1, 0.2, 0.3)),
            position=0,
        )
        chunk2 = DocumentChunk(
            id=ChunkId(uuid4()),
            content=ChunkContent(content="Chunk 2"),
            embedding=Embedding(vector=(0.4, 0.5, 0.6)),
            position=1,
        )

        # Act
        sut.add_chunk(chunk1)
        sut.add_chunk(chunk2)

        # Assert
        assert len(sut.chunks) == 2
        assert sut.chunks[0] == chunk1
        assert sut.chunks[1] == chunk2

    def test_add_chunk_preserves_position_order(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()
        chunks = [
            DocumentChunk(
                id=ChunkId(uuid4()),
                content=ChunkContent(content=f"Chunk {i}"),
                embedding=Embedding(vector=(float(i), 0.0, 0.0)),
                position=i,
            )
            for i in range(5)
        ]

        # Act
        for chunk in chunks:
            sut.add_chunk(chunk)

        # Assert
        for i, chunk in enumerate(sut.chunks):
            assert chunk.position == i


class TestLessonIndexMarkIndexed:
    """Tests for LessonIndex.mark_indexed() method."""

    def test_mark_indexed_from_indexing(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()

        # Act
        sut.mark_indexed()

        # Assert
        assert sut.status == IndexStatus.READY

    def test_mark_indexed_emits_event(self) -> None:
        # Arrange
        events_collection = EventsCollection(events=deque())
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=events_collection,
        )
        sut.start_indexing()
        sut.add_chunk(
            DocumentChunk(
                id=ChunkId(uuid4()),
                content=ChunkContent(content="Chunk"),
                embedding=Embedding(vector=(0.1, 0.2, 0.3)),
                position=0,
            )
        )
        events_collection.events.clear()

        # Act
        sut.mark_indexed()

        # Assert
        assert len(events_collection.events) == 1
        event = events_collection.events[0]
        assert isinstance(event, LessonIndexed)
        assert event.chunks_count == 1

    def test_mark_indexed_not_in_indexing_state_raises(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )

        # Act & Assert
        with pytest.raises(LessonNotInIndexingStateError):
            sut.mark_indexed()

    def test_mark_indexed_with_multiple_chunks(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()
        for i in range(10):
            sut.add_chunk(
                DocumentChunk(
                    id=ChunkId(uuid4()),
                    content=ChunkContent(content=f"Chunk {i}"),
                    embedding=Embedding(vector=(float(i), 0.0, 0.0)),
                    position=i,
                )
            )

        # Act
        sut.mark_indexed()

        # Assert
        assert sut.status == IndexStatus.READY
        assert len(sut.chunks) == 10


class TestLessonIndexMarkFailed:
    """Tests for LessonIndex.mark_failed() method."""

    def test_mark_failed(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        reason = "Embedding API error"

        # Act
        sut.mark_failed(reason=reason)

        # Assert
        assert sut.status == IndexStatus.FAILED

    def test_mark_failed_emits_event(self) -> None:
        # Arrange
        events_collection = EventsCollection(events=deque())
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=events_collection,
        )
        reason = "Embedding API error"
        events_collection.events.clear()

        # Act
        sut.mark_failed(reason=reason)

        # Assert
        assert len(events_collection.events) == 1
        event = events_collection.events[0]
        assert isinstance(event, LessonIndexingFailed)
        assert event.reason == reason

    def test_mark_failed_from_any_state(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()
        sut.mark_indexed()

        # Act
        sut.mark_failed(reason="Error")

        # Assert
        assert sut.status == IndexStatus.FAILED


class TestLessonIndexReindex:
    """Tests for LessonIndex.reindex() method."""

    def test_reindex_from_ready(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()
        sut.add_chunk(
            DocumentChunk(
                id=ChunkId(uuid4()),
                content=ChunkContent(content="Chunk"),
                embedding=Embedding(vector=(0.1, 0.2, 0.3)),
                position=0,
            )
        )
        sut.mark_indexed()

        # Act
        sut.reindex()

        # Assert
        assert sut.status == IndexStatus.INDEXING
        assert sut.chunks == []  # Chunks cleared
        assert sut.title == "Test"  # Title preserved

    def test_reindex_with_new_title(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Old Title",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()
        sut.mark_indexed()
        new_title = "New Title"

        # Act
        sut.reindex(new_title=new_title)

        # Assert
        assert sut.title == new_title
        assert sut.status == IndexStatus.INDEXING

    def test_reindex_emits_reindex_event(self) -> None:
        # Arrange
        events_collection = EventsCollection(events=deque())
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=events_collection,
        )
        sut.start_indexing()
        sut.mark_indexed()
        events_collection.events.clear()

        # Act
        sut.reindex()

        # Assert
        assert len(events_collection.events) == 1
        event = events_collection.events[0]
        assert isinstance(event, LessonReindexRequested)

    def test_reindex_from_indexing_raises(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()

        # Act & Assert
        with pytest.raises(LessonAlreadyIndexingError):
            sut.reindex()

    def test_reindex_from_pending(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )

        # Act
        sut.reindex()

        # Assert
        assert sut.status == IndexStatus.INDEXING
        assert sut.chunks == []

    def test_reindex_from_failed(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )
        sut.start_indexing()
        sut.mark_failed("Error")

        # Act
        sut.reindex()

        # Assert
        assert sut.status == IndexStatus.INDEXING
        assert sut.chunks == []


class TestLessonIndexStatusTransitions:
    """Tests for LessonIndex status transitions."""

    def test_initial_status_is_pending(self) -> None:
        # Arrange & Act
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )

        # Assert
        assert sut.status == IndexStatus.PENDING

    def test_full_lifecycle(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )

        # Act & Assert - PENDING to INDEXING
        sut.start_indexing()
        assert sut.status == IndexStatus.INDEXING

        # Add chunks
        sut.add_chunk(
            DocumentChunk(
                id=ChunkId(uuid4()),
                content=ChunkContent(content="Chunk"),
                embedding=Embedding(vector=(0.1, 0.2, 0.3)),
                position=0,
            )
        )

        # INDEXING to READY
        sut.mark_indexed()
        assert sut.status == IndexStatus.READY

    def test_failed_state_transitions(self) -> None:
        # Arrange
        sut = LessonIndex.create(
            lesson_id=LessonId(uuid4()),
            title="Test",
            events_collection=EventsCollection(events=deque()),
        )

        # Act & Assert
        sut.start_indexing()
        assert sut.status == IndexStatus.INDEXING

        sut.mark_failed("Error")
        assert sut.status == IndexStatus.FAILED

        # Can restart from FAILED
        sut.start_indexing()
        assert sut.status == IndexStatus.INDEXING
