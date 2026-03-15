import logging
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Final, final

from answer_service.application.common.inbox_message import InboxMessage
from answer_service.application.common.ports.inbox_repository import InboxRepository
from answer_service.application.errors import DuplicateInboxMessageError

logger: Final[logging.Logger] = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class CheckInboxCommand:
    message_id: str


@final
class CheckInboxCommandHandler:
    def __init__(self, inbox_repository: InboxRepository) -> None:
        self._inbox_repository: Final[InboxRepository] = inbox_repository

    async def __call__(self, data: CheckInboxCommand) -> None:
        logger.debug("check_inbox: message_id='%s'.", data.message_id)

        if await self._inbox_repository.exists(data.message_id):
            logger.info(
                "check_inbox: duplicate message, skipping. message_id='%s'.",
                data.message_id,
            )
            raise DuplicateInboxMessageError(data.message_id)

        await self._inbox_repository.save(
            InboxMessage(message_id=data.message_id, created_at=datetime.now(UTC))
        )
        logger.debug("check_inbox: saved. message_id='%s'.", data.message_id)
