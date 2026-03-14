import logging
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

from answer_service.application.common.ports.embedding_port import EmbeddingPort
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.lesson_index_repository import LessonIndexRepository
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.ports.vector_search_port import ChunkVector, VectorSearchPort
from answer_service.application.errors import LessonIndexNotFoundError
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.lesson_index.entities.document_chunk import DocumentChunk
from answer_service.domain.lesson_index.factories.lesson_index_factory import LessonIndexFactory
from answer_service.domain.lesson_index.services.text_splitter_service import TextSplitterService
from answer_service.domain.lesson_index.value_objects.embedding import Embedding

logger: Final[logging.Logger] = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class ReindexLessonCommand:
    lesson_id: UUID
    new_content: str
    new_title: str | None = None


@final
class ReindexLessonCommandHandler:
    def __init__(
        self,
        transaction_manager: TransactionManager,
        lesson_index_repository: LessonIndexRepository,
        lesson_index_factory: LessonIndexFactory,
        text_splitter_service: TextSplitterService,
        embedding_port: EmbeddingPort,
        vector_search_port: VectorSearchPort,
        events_collection: EventsCollection,
        event_bus: EventBus,
    ) -> None:
        self._transaction_manager: Final[TransactionManager] = transaction_manager
        self._lesson_index_repository: Final[LessonIndexRepository] = lesson_index_repository
        self._lesson_index_factory: Final[LessonIndexFactory] = lesson_index_factory
        self._text_splitter_service: Final[TextSplitterService] = text_splitter_service
        self._embedding_port: Final[EmbeddingPort] = embedding_port
        self._vector_search_port: Final[VectorSearchPort] = vector_search_port
        self._events_collection: Final[EventsCollection] = events_collection
        self._event_bus: Final[EventBus] = event_bus

    async def __call__(self, data: ReindexLessonCommand) -> None:
        logger.info("reindex_lesson: started. lesson_id='%s'.", data.lesson_id)

        lesson_index = await self._lesson_index_repository.get_by_lesson_id(data.lesson_id)
        if lesson_index is None:
            msg = f"LessonIndex for lesson '{data.lesson_id}' not found."
            raise LessonIndexNotFoundError(msg)

        # Remove existing vectors from ChromaDB before rebuilding
        await self._vector_search_port.delete_by_lesson(data.lesson_id)

        # Transition aggregate to INDEXING, clear old chunks, optionally update title
        lesson_index.reindex(new_title=data.new_title)

        chunk_contents = self._text_splitter_service.split(data.new_content)
        logger.debug("reindex_lesson: text split. chunks_count=%d.", len(chunk_contents))

        raw_vectors = await self._embedding_port.embed_many(
            [str(c) for c in chunk_contents]
        )

        chunks: list[DocumentChunk] = []
        for position, (chunk_content, raw_vector) in enumerate(
            zip(chunk_contents, raw_vectors, strict=True)
        ):
            chunk = self._lesson_index_factory.create_chunk(
                content=chunk_content,
                embedding=Embedding(vector=tuple(raw_vector)),
                position=position,
            )
            lesson_index.add_chunk(chunk)
            chunks.append(chunk)

        lesson_index.mark_indexed()

        # Persist metadata + chunk text/position to PostgreSQL
        await self._lesson_index_repository.save(lesson_index)
        await self._transaction_manager.flush()

        # Persist new embedding vectors to ChromaDB (outside the SQL transaction)
        await self._vector_search_port.upsert_chunks(
            [
                ChunkVector(
                    chunk_id=chunk.id,
                    lesson_id=data.lesson_id,
                    content=str(chunk.content),
                    vector=list(chunk.embedding.vector),
                )
                for chunk in chunks
            ]
        )

        await self._event_bus.publish(self._events_collection.pull_events())
        await self._transaction_manager.commit()

        logger.info("reindex_lesson: done. chunks_indexed=%d.", len(chunks))
