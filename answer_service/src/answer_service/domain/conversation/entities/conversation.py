from dataclasses import dataclass, field
from typing import Self, final

from answer_service.domain.common.aggregate import Aggregate
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.lesson_index.value_objects.lesson_id import LessonId
from answer_service.domain.user.value_objects.user_id import UserId
from answer_service.domain.conversation.entities.message import Message
from answer_service.domain.conversation.errors import ConversationClosedError, MessageNotFoundError
from answer_service.domain.conversation.events import (
    AnswerGenerated,
    AnswerGenerationFailed,
    ConversationClosed,
    ConversationStarted,
    QuestionAsked,
)
from answer_service.domain.conversation.value_objects.answer import Answer
from answer_service.domain.conversation.value_objects.conversation_id import ConversationId
from answer_service.domain.conversation.value_objects.message_id import MessageId
from answer_service.domain.conversation.value_objects.question import Question
from answer_service.domain.conversation.value_objects.statuses import ConversationStatus


@final
@dataclass(eq=False, kw_only=True)
class Conversation(Aggregate[ConversationId]):
    user_id: UserId
    lesson_id: LessonId
    messages: list[Message] = field(default_factory=list)
    status: ConversationStatus = field(default=ConversationStatus.ACTIVE)

    @classmethod
    def create(
        cls,
        conversation_id: ConversationId,
        user_id: UserId,
        lesson_id: LessonId,
        events_collection: EventsCollection,
    ) -> Self:
        conversation = cls(
            id=conversation_id,
            user_id=user_id,
            lesson_id=lesson_id,
            events_collection=events_collection,
        )
        conversation.events_collection.add_event(
            ConversationStarted(
                conversation_id=conversation_id,
                user_id=user_id,
                lesson_id=lesson_id,
            )
        )
        return conversation

    def ask_question(self, message_id: MessageId, question: Question) -> Message:
        self._ensure_active()
        message = Message(id=message_id, question=question)
        self.messages.append(message)
        self.events_collection.add_event(
            QuestionAsked(
                conversation_id=self.id,
                message_id=message_id,
                question=question,
            )
        )
        return message

    def set_answer(self, message_id: MessageId, answer: Answer) -> None:
        message = self._get_message(message_id)
        message.set_answer(answer)
        self.events_collection.add_event(
            AnswerGenerated(
                conversation_id=self.id,
                message_id=message_id,
                answer=answer,
            )
        )

    def mark_answer_failed(self, message_id: MessageId, reason: str) -> None:
        message = self._get_message(message_id)
        message.mark_failed()
        self.events_collection.add_event(
            AnswerGenerationFailed(
                conversation_id=self.id,
                message_id=message_id,
                reason=reason,
            )
        )

    def close(self) -> None:
        self._ensure_active()
        self.status = ConversationStatus.CLOSED
        self.events_collection.add_event(ConversationClosed(conversation_id=self.id))

    def get_history(self, limit: int = 10) -> list[Message]:
        """Return the last `limit` messages for LLM context window."""
        return self.messages[-limit:]

    def _get_message(self, message_id: MessageId) -> Message:
        for message in self.messages:
            if message.id == message_id:
                return message
        msg = f"Message '{message_id}' not found in conversation '{self.id}'."
        raise MessageNotFoundError(msg)

    def _ensure_active(self) -> None:
        if self.status == ConversationStatus.CLOSED:
            msg = f"Conversation '{self.id}' is already closed."
            raise ConversationClosedError(msg)
