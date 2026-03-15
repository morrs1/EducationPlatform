from answer_service.domain.common.service import BaseDomainService
from answer_service.domain.lesson_index.value_objects.chunk_content import (
    MAX_CHUNK_LENGTH,
    ChunkContent,
)

# Sentence-ending punctuation used to detect natural split boundaries.
_SENTENCE_ENDINGS: tuple[str, ...] = (
    ".\n",
    ".\t",
    ". ",
    "!\n",
    "! ",
    "?\n",
    "? ",
    "\n\n",
)

DEFAULT_CHUNK_SIZE: int = 1000
DEFAULT_CHUNK_OVERLAP: int = 200


class TextSplitterService(BaseDomainService):
    """Splits raw lesson text into overlapping ChunkContent value objects.

    Chunking strategy is domain knowledge: chunk size and overlap directly
    affect retrieval precision and recall — the core quality metric of the
    RAG pipeline. The service tries to split on natural sentence boundaries
    to avoid cutting a thought in half.

    Invariants enforced:
    - chunk_size <= MAX_CHUNK_LENGTH (domain constraint from ChunkContent)
    - chunk_overlap < chunk_size (overlap must be smaller than the chunk)
    - All returned ChunkContent values pass their own domain validation
    """

    def split(
        self,
        text: str,
        chunk_size: int = DEFAULT_CHUNK_SIZE,
        chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
    ) -> list[ChunkContent]:
        """Split *text* into overlapping chunks and return them in order.

        :param text: Raw lesson text to split.
        :param chunk_size: Target character length of each chunk.
        :param chunk_overlap: Number of characters to repeat between adjacent chunks.
        :return: Ordered list of ChunkContent value objects.
        :raises ValueError: If chunk_size or chunk_overlap violate domain constraints.
        """
        self._validate_params(chunk_size, chunk_overlap)

        text = text.strip()
        if not text:
            return []

        raw_chunks = self._sliding_window(text, chunk_size, chunk_overlap)
        return [ChunkContent(content=chunk) for chunk in raw_chunks if chunk.strip()]

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _validate_params(chunk_size: int, chunk_overlap: int) -> None:
        if chunk_size <= 0:
            msg = f"chunk_size must be > 0, got {chunk_size}."
            raise ValueError(msg)
        if chunk_size > MAX_CHUNK_LENGTH:
            msg = f"chunk_size {chunk_size} exceeds domain maximum of {MAX_CHUNK_LENGTH}."
            raise ValueError(msg)
        if chunk_overlap < 0:
            msg = f"chunk_overlap must be >= 0, got {chunk_overlap}."
            raise ValueError(msg)
        if chunk_overlap >= chunk_size:
            msg = (
                f"chunk_overlap ({chunk_overlap}) must be less than"
                f" chunk_size ({chunk_size})."
            )
            raise ValueError(msg)

    @staticmethod
    def _find_sentence_boundary(text: str, ideal_end: int) -> int:
        """Look backwards from *ideal_end* for the nearest sentence boundary.

        Returns *ideal_end* unchanged if no boundary is found within the
        second half of the chunk (to avoid making chunks too small).
        """
        search_start = ideal_end // 2  # don't search further back than half the chunk
        for ending in _SENTENCE_ENDINGS:
            pos = text.rfind(ending, search_start, ideal_end)
            if pos != -1:
                return pos + len(ending)
        return ideal_end

    def _sliding_window(
        self,
        text: str,
        chunk_size: int,
        chunk_overlap: int,
    ) -> list[str]:
        chunks: list[str] = []
        start = 0

        while start < len(text):
            end = start + chunk_size

            if end >= len(text):
                # Last chunk — take whatever remains.
                chunks.append(text[start:].strip())
                break

            # Try to split at a sentence boundary to avoid cutting mid-thought.
            boundary = self._find_sentence_boundary(text, end)
            chunks.append(text[start:boundary].strip())

            # Next chunk starts (boundary - overlap) characters back so that
            # the overlap region provides retrieval continuity.
            step = boundary - start - chunk_overlap
            start += max(step, 1)  # guard against infinite loop on edge cases

        return chunks
