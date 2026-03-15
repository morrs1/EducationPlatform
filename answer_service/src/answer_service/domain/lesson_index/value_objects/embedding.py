from dataclasses import dataclass

from answer_service.domain.common.value_object import ValueObject
from answer_service.domain.lesson_index.errors import EmptyEmbeddingError


@dataclass(frozen=True, kw_only=True)
class Embedding(ValueObject):
    # tuple ensures immutability unlike list
    vector: tuple[float, ...]

    @property
    def dimension(self) -> int:
        return len(self.vector)

    def _validate(self) -> None:
        if not self.vector:
            msg = "Embedding vector cannot be empty."
            raise EmptyEmbeddingError(msg)

    def __str__(self) -> str:
        return f"Embedding(dim={self.dimension})"
