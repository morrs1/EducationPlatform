from dataclasses import dataclass

from answer_service.domain.common.value_object import ValueObject
from answer_service.domain.lesson_index.errors import ChunkContentTooLongError, EmptyChunkContentError

MAX_CHUNK_LENGTH: int = 8192


@dataclass(frozen=True, kw_only=True)
class ChunkContent(ValueObject):
    content: str

    def _validate(self) -> None:
        if not self.content.strip():
            raise EmptyChunkContentError("Chunk content cannot be empty.")
        if len(self.content) > MAX_CHUNK_LENGTH:
            msg = f"Chunk content exceeds maximum length of {MAX_CHUNK_LENGTH} characters."
            raise ChunkContentTooLongError(msg)

    def __str__(self) -> str:
        return self.content
