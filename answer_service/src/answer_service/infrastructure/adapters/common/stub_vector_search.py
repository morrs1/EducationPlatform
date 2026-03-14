from typing import override
from uuid import UUID

from answer_service.application.common.ports.vector_search_port import VectorSearchPort, VectorSearchResult


class StubVectorSearchPort(VectorSearchPort):
    """Stub vector search adapter. Replace with a ChromaDB implementation."""

    @override
    async def search(
        self,
        query_vector: list[float],
        lesson_id: UUID,
        top_k: int = 5,
    ) -> list[VectorSearchResult]:
        raise NotImplementedError("VectorSearch adapter is not implemented yet.")

    @override
    async def delete_by_lesson(self, lesson_id: UUID) -> None:
        raise NotImplementedError("VectorSearch adapter is not implemented yet.")
