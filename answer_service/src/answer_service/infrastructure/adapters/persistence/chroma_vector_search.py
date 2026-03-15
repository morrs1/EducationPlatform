import asyncio
from typing import TYPE_CHECKING, Final, override
from uuid import UUID

from langchain_chroma import Chroma

if TYPE_CHECKING:
    from langchain_core.documents import Document

from answer_service.application.common.ports.vector_search_port import (
    ChunkVector,
    VectorSearchPort,
    VectorSearchResult,
)
from answer_service.infrastructure.mappers.vector_search_mapper import (
    VectorSearchResultMapper,
)


class ChromaVectorSearchPort(VectorSearchPort):
    """VectorSearchPort backed by a LangChain-Chroma vectorstore."""

    def __init__(self, vectorstore: Chroma, mapper: VectorSearchResultMapper) -> None:
        self._vectorstore: Final[Chroma] = vectorstore
        self._mapper: Final[VectorSearchResultMapper] = mapper

    @override
    async def upsert_chunks(self, chunks: list[ChunkVector]) -> None:
        if not chunks:
            return
        collection = self._vectorstore._collection  # noqa: SLF001
        await asyncio.to_thread(
            collection.upsert,
            ids=[str(c.chunk_id) for c in chunks],
            documents=[c.content for c in chunks],
            embeddings=[[*c.vector] for c in chunks],  # type: ignore[arg-type]
            metadatas=[
                {"lesson_id": str(c.lesson_id), "chunk_id": str(c.chunk_id)}
                for c in chunks
            ],
        )

    @override
    async def search(
        self,
        query_vector: list[float],
        lesson_id: UUID,
        top_k: int = 5,
    ) -> list[VectorSearchResult]:
        raw: list[tuple[Document, float]] = await asyncio.to_thread(
            self._vectorstore.similarity_search_by_vector_with_relevance_scores,
            embedding=query_vector,
            k=top_k,
            filter={"lesson_id": str(lesson_id)},
        )
        return self._mapper.map_many(raw)

    @override
    async def delete_by_lesson(self, lesson_id: UUID) -> None:
        collection_data: dict[str, list[str]] = await asyncio.to_thread(
            self._vectorstore.get,
            where={"lesson_id": str(lesson_id)},
        )
        ids: list[str] = collection_data.get("ids", [])
        if ids:
            await asyncio.to_thread(self._vectorstore.delete, ids=ids)
