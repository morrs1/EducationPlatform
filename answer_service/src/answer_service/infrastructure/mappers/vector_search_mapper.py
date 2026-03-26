from dataclasses import dataclass
from typing import Final
from uuid import UUID

from adaptix.conversion import coercer, get_converter
from langchain_core.documents import Document

from answer_service.application.common.ports.vector_search_port import VectorSearchResult


@dataclass(frozen=True, slots=True)
class RawSearchResult:
    """Intermediate dataclass holding raw Chroma fields before domain conversion."""

    chunk_id: str  # raw string from document metadata
    content: str
    score: float


_to_domain: Final = get_converter(
    RawSearchResult,
    VectorSearchResult,
    recipe=[
        coercer(str, UUID, UUID),  # chunk_id: str → UUID
    ],
)


class VectorSearchResultMapper:
    """Maps a LangChain ``(Document, score)`` pair to a domain ``VectorSearchResult``."""

    def map(self, source: tuple[Document, float]) -> VectorSearchResult:
        doc, score = source
        return _to_domain(
            RawSearchResult(
                chunk_id=doc.metadata["chunk_id"],
                content=doc.page_content,
                score=score,
            )
        )

    def map_many(self, source: list[tuple[Document, float]]) -> list[VectorSearchResult]:
        return [self.map(item) for item in source]
