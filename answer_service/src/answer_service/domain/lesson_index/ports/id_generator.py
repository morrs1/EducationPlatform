from abc import abstractmethod
from typing import Protocol

from answer_service.domain.lesson_index.value_objects.chunk_id import ChunkId


class ChunkIdGenerator(Protocol):
    @abstractmethod
    def __call__(self) -> ChunkId:
        raise NotImplementedError
