from typing import final

from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.lesson_index.value_objects.lesson_id import LessonId
from answer_service.domain.lesson_index.entities.document_chunk import DocumentChunk
from answer_service.domain.lesson_index.entities.lesson_index import LessonIndex
from answer_service.domain.lesson_index.ports.id_generator import ChunkIdGenerator
from answer_service.domain.lesson_index.value_objects.chunk_content import ChunkContent
from answer_service.domain.lesson_index.value_objects.embedding import Embedding


@final
class LessonIndexFactory:
    """Domain factory for LessonIndex aggregate.

    Receives EventsCollection and ID generators via DI (Dishka, request scope).
    """

    def __init__(
        self,
        events_collection: EventsCollection,
        chunk_id_generator: ChunkIdGenerator,
    ) -> None:
        self._events_collection = events_collection
        self._chunk_id_generator = chunk_id_generator

    def create_index(self, lesson_id: LessonId, title: str) -> LessonIndex:
        return LessonIndex.create(
            lesson_id=lesson_id,
            title=title,
            events_collection=self._events_collection,
        )

    def create_chunk(
        self,
        content: ChunkContent,
        embedding: Embedding,
        position: int,
    ) -> DocumentChunk:
        return DocumentChunk(
            id=self._chunk_id_generator(),
            content=content,
            embedding=embedding,
            position=position,
        )
