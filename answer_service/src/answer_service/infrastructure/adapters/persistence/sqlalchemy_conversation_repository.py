import logging
from typing import Final, override
from uuid import UUID

from sqlalchemy import and_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from answer_service.application.common.ports.conversation_repository import ConversationRepository
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.entities.conversation import Conversation
from answer_service.infrastructure.errors import RepoError
from answer_service.infrastructure.persistence.models.conversation import conversations_table

logger: Final[logging.Logger] = logging.getLogger(__name__)


class SqlAlchemyConversationRepository(ConversationRepository):
    def __init__(
        self,
        session: AsyncSession,
        events_collection: EventsCollection,
    ) -> None:
        self._session: Final[AsyncSession] = session
        self._events_collection: Final[EventsCollection] = events_collection

    @override
    async def save(self, conversation: Conversation) -> None:
        self._session.add(conversation)

    @override
    async def get_by_id(self, conversation_id: UUID) -> Conversation | None:
        stmt = select(Conversation).where(conversations_table.c.id == conversation_id)
        try:
            result = (await self._session.execute(stmt)).scalar_one_or_none()
        except SQLAlchemyError as e:
            raise RepoError("Database query failed.") from e
        return self._inject(result) if result is not None else None

    @override
    async def get_by_user_and_lesson(
        self,
        user_id: UUID,
        lesson_id: UUID,
    ) -> Conversation | None:
        stmt = select(Conversation).where(
            and_(
                conversations_table.c.user_id == user_id,
                conversations_table.c.lesson_id == lesson_id,
            )
        )
        try:
            result = (await self._session.execute(stmt)).scalar_one_or_none()
        except SQLAlchemyError as e:
            raise RepoError("Database query failed.") from e
        return self._inject(result) if result is not None else None

    def _inject(self, conversation: Conversation) -> Conversation:
        conversation.events_collection = self._events_collection
        return conversation
