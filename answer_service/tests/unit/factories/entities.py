"""Factory functions for creating domain entities in tests."""

from collections import deque
from uuid import uuid4

from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.entities.conversation import Conversation
from answer_service.domain.conversation.value_objects.conversation_id import (
    ConversationId,
)
from answer_service.domain.lesson_index.value_objects.lesson_id import LessonId
from answer_service.domain.user.entities.user import User
from answer_service.domain.user.value_objects.user_id import UserId


def make_events_collection() -> EventsCollection:
    return EventsCollection(events=deque())


def make_user(
    user_id: UserId | None = None,
    events_collection: EventsCollection | None = None,
) -> User:
    return User.create(
        user_id=user_id or UserId(uuid4()),
        events_collection=events_collection or make_events_collection(),
    )


def make_conversation(
    conversation_id: ConversationId | None = None,
    user_id: UserId | None = None,
    lesson_id: LessonId | None = None,
    events_collection: EventsCollection | None = None,
) -> Conversation:
    return Conversation.create(
        conversation_id=conversation_id or ConversationId(uuid4()),
        user_id=user_id or UserId(uuid4()),
        lesson_id=lesson_id or LessonId(uuid4()),
        events_collection=events_collection or make_events_collection(),
    )
