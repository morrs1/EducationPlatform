import logging
from typing import Final, override

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from answer_service.application.common.inbox_message import InboxMessage
from answer_service.application.common.ports.inbox_repository import InboxRepository
from answer_service.infrastructure.errors import RepoError
from answer_service.infrastructure.persistence.models.inbox import (
    InboxRecord,
    inbox_messages_table,
)

logger: Final[logging.Logger] = logging.getLogger(__name__)


class SqlAlchemyInboxRepository(InboxRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session: Final[AsyncSession] = session

    @override
    async def exists(self, message_id: str) -> bool:
        try:
            result = await self._session.execute(
                select(inbox_messages_table.c.message_id).where(
                    inbox_messages_table.c.message_id == message_id
                )
            )
            return result.scalar_one_or_none() is not None
        except SQLAlchemyError as e:
            msg = "Failed to check inbox message existence."
            raise RepoError(msg) from e

    @override
    async def save(self, message: InboxMessage) -> None:
        record = InboxRecord(
            message_id=message.message_id,
            created_at=message.created_at,
        )
        try:
            self._session.add(record)
        except SQLAlchemyError as e:
            msg = "Failed to save inbox message."
            raise RepoError(msg) from e
        logger.debug("Inbox message saved: %s", message.message_id)
