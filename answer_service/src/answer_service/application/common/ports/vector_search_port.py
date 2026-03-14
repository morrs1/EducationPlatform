from abc import abstractmethod
from dataclasses import dataclass
from typing import Protocol
from uuid import UUID


@dataclass(frozen=True, slots=True)
class VectorSearchResult:
    chunk_id: UUID
    content: str
    score: float    # cosine similarity [0, 1]


@dataclass(frozen=True, slots=True)
class ChunkVector:
    chunk_id: UUID
    lesson_id: UUID
    content: str
    vector: list[float]


class VectorSearchPort(Protocol):
    @abstractmethod
    async def upsert_chunks(self, chunks: list[ChunkVector]) -> None:
        """Store or replace embedding vectors for a list of chunks."""
        raise NotImplementedError

    @abstractmethod
    async def search(
        self,
        query_vector: list[float],
        lesson_id: UUID,
        top_k: int = 5,
    ) -> list[VectorSearchResult]:
        """Find the top-k most similar chunks for a given lesson.

        :param query_vector: Embedding of the user question.
        :param lesson_id: Scope the search to one lesson's index.
        :param top_k: Number of results to return.
        """
        raise NotImplementedError

    @abstractmethod
    async def delete_by_lesson(self, lesson_id: UUID) -> None:
        """Remove all vectors belonging to a lesson (used during reindex)."""
        raise NotImplementedError
