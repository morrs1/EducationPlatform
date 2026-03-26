from abc import abstractmethod
from typing import Protocol
from uuid import UUID

from answer_service.application.common.query_params.conversation_params import (
    ConversationListParams,
)
from answer_service.domain.conversation.entities.conversation import Conversation


class ConversationRepository(Protocol):
    @abstractmethod
    async def save(self, conversation: Conversation) -> None:
        raise NotImplementedError

    @abstractmethod
    async def get_by_id(self, conversation_id: UUID) -> Conversation | None:
        raise NotImplementedError

    @abstractmethod
    async def get_by_user_and_lesson(
        self,
        user_id: UUID,
        lesson_id: UUID,
    ) -> Conversation | None:
        """Return the active conversation for a given user+lesson pair, if any."""
        raise NotImplementedError

    @abstractmethod
    async def get_all_by_user(
        self,
        user_id: UUID,
        params: ConversationListParams,
    ) -> list[Conversation]:
        raise NotImplementedError
