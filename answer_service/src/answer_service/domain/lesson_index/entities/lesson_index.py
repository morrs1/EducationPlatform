from dataclasses import dataclass, field
from typing import Self, final

from answer_service.domain.common.aggregate import Aggregate
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.lesson_index.value_objects.lesson_id import LessonId
from answer_service.domain.lesson_index.entities.document_chunk import DocumentChunk
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
from answer_service.domain.lesson_index.value_objects.index_status import IndexStatus


@final
@dataclass(eq=False, kw_only=True)
class LessonIndex(Aggregate[LessonId]):
    title: str
    chunks: list[DocumentChunk] = field(default_factory=list)
    status: IndexStatus = field(default=IndexStatus.PENDING)

    @classmethod
    def create(
        cls,
        lesson_id: LessonId,
        title: str,
        events_collection: EventsCollection,
    ) -> Self:
        index = cls(
            id=lesson_id,
            title=title,
            events_collection=events_collection,
        )
        index.events_collection.add_event(
            LessonIndexingRequested(lesson_id=lesson_id, title=title)
        )
        return index

    def start_indexing(self) -> None:
        """Transition to INDEXING state. Called by the application layer before adding chunks."""
        self.status = IndexStatus.INDEXING

    def add_chunk(self, chunk: DocumentChunk) -> None:
        self._ensure_indexing()
        self.chunks.append(chunk)

    def mark_indexed(self) -> None:
        self._ensure_indexing()
        self.status = IndexStatus.READY
        self.events_collection.add_event(
            LessonIndexed(lesson_id=self.id, chunks_count=len(self.chunks))
        )

    def mark_failed(self, reason: str) -> None:
        self.status = IndexStatus.FAILED
        self.events_collection.add_event(
            LessonIndexingFailed(lesson_id=self.id, reason=reason)
        )

    def reindex(self, new_title: str | None = None) -> None:
        """Clear existing chunks and restart indexing (e.g. when lesson content changes)."""
        if self.status == IndexStatus.INDEXING:
            msg = f"Lesson '{self.id}' is already being indexed."
            raise LessonAlreadyIndexingError(msg)
        if new_title is not None:
            self.title = new_title
        self.chunks.clear()
        self.status = IndexStatus.INDEXING
        self.events_collection.add_event(
            LessonReindexRequested(lesson_id=self.id, title=self.title)
        )

    def _ensure_indexing(self) -> None:
        if self.status != IndexStatus.INDEXING:
            msg = (
                f"LessonIndex '{self.id}' is not in INDEXING state "
                f"(current: '{self.status}')."
            )
            raise LessonNotInIndexingStateError(msg)
