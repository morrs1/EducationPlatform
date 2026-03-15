import logging
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.user.entities.user import User
from answer_service.domain.user.value_objects.user_id import UserId

logger: Final[logging.Logger] = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class CreateUserCommand:
    user_id: UUID


@final
class CreateUserCommandHandler:
    def __init__(
        self,
        transaction_manager: TransactionManager,
        user_repository: UserRepository,
        events_collection: EventsCollection,
        event_bus: EventBus,
    ) -> None:
        self._transaction_manager: Final[TransactionManager] = transaction_manager
        self._user_repository: Final[UserRepository] = user_repository
        self._events_collection: Final[EventsCollection] = events_collection
        self._event_bus: Final[EventBus] = event_bus

    async def __call__(self, data: CreateUserCommand) -> None:
        logger.info("create_user: started. user_id='%s'.", data.user_id)

        existing = await self._user_repository.get_by_id(data.user_id)
        if existing is not None:
            logger.info(
                "create_user: user already exists, skipping. user_id='%s'.", data.user_id
            )
            return

        user = User.create(
            user_id=UserId(data.user_id),
            events_collection=self._events_collection,
        )

        await self._user_repository.save(user)
        await self._transaction_manager.flush()
        await self._event_bus.publish(self._events_collection.pull_events())
        await self._transaction_manager.commit()

        logger.info("create_user: done. user_id='%s'.", data.user_id)
