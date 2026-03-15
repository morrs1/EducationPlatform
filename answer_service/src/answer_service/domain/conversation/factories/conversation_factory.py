from typing import final

from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.entities.conversation import Conversation
from answer_service.domain.conversation.entities.message import Message
from answer_service.domain.conversation.ports.id_generator import (
    ConversationIdGenerator,
    MessageIdGenerator,
)
from answer_service.domain.conversation.value_objects.question import Question
from answer_service.domain.lesson_index.value_objects.lesson_id import LessonId
from answer_service.domain.user.value_objects.user_id import UserId


@final
class ConversationFactory:
    """Domain factory for Conversation aggregate.

    Receives EventsCollection and ID generators via DI (Dishka, request scope).
    EventsCollection is shared across all aggregates within a single request,
    so all domain events are collected together and published at the end.
    """

    def __init__(
        self,
        events_collection: EventsCollection,
        conversation_id_generator: ConversationIdGenerator,
        message_id_generator: MessageIdGenerator,
    ) -> None:
        self._events_collection = events_collection
        self._conversation_id_generator = conversation_id_generator
        self._message_id_generator = message_id_generator

    def create_conversation(self, user_id: UserId, lesson_id: LessonId) -> Conversation:
        return Conversation.create(
            conversation_id=self._conversation_id_generator(),
            user_id=user_id,
            lesson_id=lesson_id,
            events_collection=self._events_collection,
        )

    def create_message(self, conversation: Conversation, question: Question) -> Message:
        return conversation.ask_question(
            message_id=self._message_id_generator(),
            question=question,
        )
