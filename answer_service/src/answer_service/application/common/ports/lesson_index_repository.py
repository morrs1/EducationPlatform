from abc import abstractmethod
from typing import Protocol
from uuid import UUID

from answer_service.domain.lesson_index.entities.lesson_index import LessonIndex


class LessonIndexRepository(Protocol):
    @abstractmethod
    async def save(self, lesson_index: LessonIndex) -> None:
        """Persist LessonIndex metadata (PostgreSQL) and chunk embeddings (ChromaDB)."""
        raise NotImplementedError

    @abstractmethod
    async def get_by_lesson_id(self, lesson_id: UUID) -> LessonIndex | None:
        raise NotImplementedError
