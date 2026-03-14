import logging
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

from answer_service.application.common.ports.conversation_repository import ConversationRepository
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.views.conversation_views import ConversationCreatedView
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.factories.conversation_factory import ConversationFactory
from answer_service.domain.lesson_index.value_objects.lesson_id import LessonId
from answer_service.domain.user.value_objects.user_id import UserId

logger: Final[logging.Logger] = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class CreateConversationCommand:
    user_id: UUID
    lesson_id: UUID


@final
class CreateConversationCommandHandler:
    def __init__(
        self,
        transaction_manager: TransactionManager,
        conversation_repository: ConversationRepository,
        conversation_factory: ConversationFactory,
        events_collection: EventsCollection,
        event_bus: EventBus,
    ) -> None:
        self._transaction_manager: Final[TransactionManager] = transaction_manager
        self._conversation_repository: Final[ConversationRepository] = conversation_repository
        self._conversation_factory: Final[ConversationFactory] = conversation_factory
        self._events_collection: Final[EventsCollection] = events_collection
        self._event_bus: Final[EventBus] = event_bus

    async def __call__(self, data: CreateConversationCommand) -> ConversationCreatedView:
        logger.info(
            "create_conversation: started. user_id='%s', lesson_id='%s'.",
            data.user_id,
            data.lesson_id,
        )

        conversation = self._conversation_factory.create_conversation(
            user_id=UserId(data.user_id),
            lesson_id=LessonId(data.lesson_id),
        )

        await self._conversation_repository.save(conversation)
        await self._transaction_manager.flush()
        await self._event_bus.publish(self._events_collection.pull_events())
        await self._transaction_manager.commit()

        logger.info("create_conversation: done. conversation_id='%s'.", conversation.id)

        return ConversationCreatedView(conversation_id=conversation.id)
