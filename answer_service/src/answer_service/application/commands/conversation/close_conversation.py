import structlog
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

from answer_service.application.common.ports.conversation_repository import ConversationRepository
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.domain.common.events_collection import EventsCollection

logger: Final[structlog.BoundLogger] = structlog.get_logger()


class ConversationNotFoundError(Exception):
    pass


@dataclass(frozen=True, slots=True, kw_only=True)
class CloseConversationCommand:
    conversation_id: UUID


@final
class CloseConversationCommandHandler:
    def __init__(
        self,
        transaction_manager: TransactionManager,
        conversation_repository: ConversationRepository,
        events_collection: EventsCollection,
        event_bus: EventBus,
    ) -> None:
        self._transaction_manager: Final[TransactionManager] = transaction_manager
        self._conversation_repository: Final[ConversationRepository] = conversation_repository
        self._events_collection: Final[EventsCollection] = events_collection
        self._event_bus: Final[EventBus] = event_bus

    async def __call__(self, data: CloseConversationCommand) -> None:
        log = logger.bind(conversation_id=str(data.conversation_id))
        log.info("close_conversation: started")

        conversation = await self._conversation_repository.get_by_id(data.conversation_id)
        if conversation is None:
            msg = f"Conversation '{data.conversation_id}' not found."
            raise ConversationNotFoundError(msg)

        conversation.close()

        await self._conversation_repository.save(conversation)
        await self._transaction_manager.flush()
        await self._event_bus.publish(self._events_collection.pull_events())
        await self._transaction_manager.commit()

        log.info("close_conversation: done")
