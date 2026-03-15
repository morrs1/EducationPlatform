from dataclasses import dataclass

from answer_service.domain.common.events import Event
from answer_service.domain.conversation.value_objects.answer import Answer
from answer_service.domain.conversation.value_objects.conversation_id import (
    ConversationId,
)
from answer_service.domain.conversation.value_objects.message_id import MessageId
from answer_service.domain.conversation.value_objects.question import Question
from answer_service.domain.lesson_index.value_objects.lesson_id import LessonId
from answer_service.domain.user.value_objects.user_id import UserId


@dataclass(frozen=True, kw_only=True)
class ConversationStarted(Event):
    conversation_id: ConversationId
    user_id: UserId
    lesson_id: LessonId


@dataclass(frozen=True, kw_only=True)
class QuestionAsked(Event):
    conversation_id: ConversationId
    message_id: MessageId
    question: Question


@dataclass(frozen=True, kw_only=True)
class AnswerGenerated(Event):
    conversation_id: ConversationId
    message_id: MessageId
    answer: Answer


@dataclass(frozen=True, kw_only=True)
class AnswerGenerationFailed(Event):
    conversation_id: ConversationId
    message_id: MessageId
    reason: str


@dataclass(frozen=True, kw_only=True)
class ConversationClosed(Event):
    conversation_id: ConversationId
