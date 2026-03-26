import logging
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.application.errors import UserNotFoundError

logger: Final[logging.Logger] = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class DeleteUserCommand:
    user_id: UUID


@final
class DeleteUserCommandHandler:
    def __init__(
        self,
        transaction_manager: TransactionManager,
        user_repository: UserRepository,
        event_bus: EventBus,
    ) -> None:
        self._transaction_manager: Final[TransactionManager] = transaction_manager
        self._user_repository: Final[UserRepository] = user_repository
        self._event_bus: Final[EventBus] = event_bus

    async def __call__(self, data: DeleteUserCommand) -> None:
        logger.info("delete_user: started. user_id='%s'.", data.user_id)

        existing = await self._user_repository.get_by_id(data.user_id)
        if existing is None:
            msg = f"User '{data.user_id}' not found."
            raise UserNotFoundError(msg)

        await self._user_repository.delete(data.user_id)
        await self._transaction_manager.flush()
        await self._transaction_manager.commit()

        logger.info("delete_user: done. user_id='%s'.", data.user_id)
