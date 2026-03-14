"""Tests for Conversation aggregate."""

from collections import deque
from uuid import uuid4

import pytest

from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.entities.conversation import Conversation
from answer_service.domain.conversation.errors import (
    ConversationClosedError,
    MessageNotFoundError,
)
from answer_service.domain.conversation.events import (
    AnswerGenerated,
    AnswerGenerationFailed,
    ConversationClosed,
    ConversationStarted,
    QuestionAsked,
)
from answer_service.domain.conversation.value_objects.answer import Answer
from answer_service.domain.conversation.value_objects.conversation_id import (
    ConversationId,
)
from answer_service.domain.conversation.value_objects.message_id import MessageId
from answer_service.domain.conversation.value_objects.model_name import ModelName
from answer_service.domain.conversation.value_objects.question import Question
from answer_service.domain.conversation.value_objects.statuses import (
    ConversationStatus,
    MessageStatus,
)
from answer_service.domain.conversation.value_objects.token_usage import TokenUsage
from answer_service.domain.lesson_index.value_objects.lesson_id import LessonId
from answer_service.domain.user.value_objects.user_id import UserId


class TestConversationCreation:
    """Tests for Conversation.create() method."""

    def test_create_conversation(self) -> None:
        # Arrange
        conversation_id = ConversationId(uuid4())
        user_id = UserId(uuid4())
        lesson_id = LessonId(uuid4())
        events_collection = EventsCollection(events=deque())

        # Act
        sut = Conversation.create(
            conversation_id=conversation_id,
            user_id=user_id,
            lesson_id=lesson_id,
            events_collection=events_collection,
        )

        # Assert
        assert sut.id == conversation_id
        assert sut.user_id == user_id
        assert sut.lesson_id == lesson_id
        assert sut.messages == []
        assert sut.status == ConversationStatus.ACTIVE

    def test_create_conversation_emits_conversation_started_event(self) -> None:
        # Arrange
        conversation_id = ConversationId(uuid4())
        user_id = UserId(uuid4())
        lesson_id = LessonId(uuid4())
        events_collection = EventsCollection(events=deque())

        # Act
        Conversation.create(
            conversation_id=conversation_id,
            user_id=user_id,
            lesson_id=lesson_id,
            events_collection=events_collection,
        )

        # Assert
        assert len(events_collection.events) == 1
        event = events_collection.events[0]
        assert isinstance(event, ConversationStarted)
        assert event.conversation_id == conversation_id
        assert event.user_id == user_id
        assert event.lesson_id == lesson_id


class TestConversationAskQuestion:
    """Tests for Conversation.ask_question() method."""

    def test_ask_question_adds_message(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )
        message_id = MessageId(uuid4())
        question = Question(content="What is Python?")

        # Act
        message = conversation.ask_question(message_id=message_id, question=question)

        # Assert
        assert len(conversation.messages) == 1
        assert conversation.messages[0] == message
        assert message.id == message_id
        assert message.question == question
        assert message.status == MessageStatus.PENDING

    def test_ask_question_emits_question_asked_event(self) -> None:
        # Arrange
        events_collection = EventsCollection(events=deque())
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=events_collection,
        )
        message_id = MessageId(uuid4())
        question = Question(content="Test question")
        events_collection.events.clear()  # Clear ConversationStarted event

        # Act
        conversation.ask_question(message_id=message_id, question=question)

        # Assert
        assert len(events_collection.events) == 1
        event = events_collection.events[0]
        assert isinstance(event, QuestionAsked)
        assert event.message_id == message_id
        assert event.question == question

    def test_ask_question_on_closed_conversation_raises(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )
        conversation.close()
        message_id = MessageId(uuid4())
        question = Question(content="Test question")

        # Act & Assert
        with pytest.raises(ConversationClosedError):
            conversation.ask_question(message_id=message_id, question=question)

    def test_ask_question_multiple_times(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )

        # Act
        message1 = conversation.ask_question(
            message_id=MessageId(uuid4()),
            question=Question(content="Question 1"),
        )
        message2 = conversation.ask_question(
            message_id=MessageId(uuid4()),
            question=Question(content="Question 2"),
        )

        # Assert
        assert len(conversation.messages) == 2
        assert conversation.messages[0] == message1
        assert conversation.messages[1] == message2


class TestConversationSetAnswer:
    """Tests for Conversation.set_answer() method."""

    def test_set_answer_on_message(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )
        message_id = MessageId(uuid4())
        question = Question(content="Question")
        conversation.ask_question(message_id=message_id, question=question)
        answer = Answer(
            content="Answer",
            token_usage=TokenUsage(input_tokens=10, output_tokens=5),
            model_name=ModelName(value="gpt-4"),
        )

        # Act
        conversation.set_answer(message_id=message_id, answer=answer)

        # Assert
        message = conversation.messages[0]
        assert message.answer == answer
        assert message.status == MessageStatus.COMPLETED

    def test_set_answer_emits_answer_generated_event(self) -> None:
        # Arrange
        events_collection = EventsCollection(events=deque())
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=events_collection,
        )
        message_id = MessageId(uuid4())
        question = Question(content="Question")
        conversation.ask_question(message_id=message_id, question=question)
        answer = Answer(
            content="Answer",
            token_usage=TokenUsage(input_tokens=10, output_tokens=5),
            model_name=ModelName(value="gpt-4"),
        )
        events_collection.events.clear()  # Clear previous events

        # Act
        conversation.set_answer(message_id=message_id, answer=answer)

        # Assert
        assert len(events_collection.events) == 1
        event = events_collection.events[0]
        assert isinstance(event, AnswerGenerated)
        assert event.message_id == message_id
        assert event.answer == answer

    def test_set_answer_on_nonexistent_message_raises(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )
        answer = Answer(
            content="Answer",
            token_usage=TokenUsage(input_tokens=10, output_tokens=5),
            model_name=ModelName(value="gpt-4"),
        )

        # Act & Assert
        with pytest.raises(MessageNotFoundError):
            conversation.set_answer(message_id=MessageId(uuid4()), answer=answer)


class TestConversationMarkAnswerFailed:
    """Tests for Conversation.mark_answer_failed() method."""

    def test_mark_answer_failed(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )
        message_id = MessageId(uuid4())
        question = Question(content="Question")
        conversation.ask_question(message_id=message_id, question=question)
        reason = "LLM API error"

        # Act
        conversation.mark_answer_failed(message_id=message_id, reason=reason)

        # Assert
        message = conversation.messages[0]
        assert message.status == MessageStatus.FAILED

    def test_mark_answer_failed_emits_event(self) -> None:
        # Arrange
        events_collection = EventsCollection(events=deque())
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=events_collection,
        )
        message_id = MessageId(uuid4())
        question = Question(content="Question")
        conversation.ask_question(message_id=message_id, question=question)
        reason = "LLM API error"
        events_collection.events.clear()

        # Act
        conversation.mark_answer_failed(message_id=message_id, reason=reason)

        # Assert
        assert len(events_collection.events) == 1
        event = events_collection.events[0]
        assert isinstance(event, AnswerGenerationFailed)
        assert event.message_id == message_id
        assert event.reason == reason

    def test_mark_answer_failed_on_nonexistent_message_raises(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )

        # Act & Assert
        with pytest.raises(MessageNotFoundError):
            conversation.mark_answer_failed(message_id=MessageId(uuid4()), reason="Error")


class TestConversationClose:
    """Tests for Conversation.close() method."""

    def test_close_active_conversation(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )

        # Act
        conversation.close()

        # Assert
        assert conversation.status == ConversationStatus.CLOSED

    def test_close_emits_conversation_closed_event(self) -> None:
        # Arrange
        events_collection = EventsCollection(events=deque())
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=events_collection,
        )
        events_collection.events.clear()

        # Act
        conversation.close()

        # Assert
        assert len(events_collection.events) == 1
        event = events_collection.events[0]
        assert isinstance(event, ConversationClosed)
        assert event.conversation_id == conversation.id

    def test_close_already_closed_conversation_raises(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )
        conversation.close()

        # Act & Assert
        with pytest.raises(ConversationClosedError):
            conversation.close()

    def test_close_conversation_with_messages(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )
        conversation.ask_question(
            message_id=MessageId(uuid4()),
            question=Question(content="Question 1"),
        )
        conversation.ask_question(
            message_id=MessageId(uuid4()),
            question=Question(content="Question 2"),
        )

        # Act
        conversation.close()

        # Assert
        assert conversation.status == ConversationStatus.CLOSED
        assert len(conversation.messages) == 2  # Messages are preserved


class TestConversationGetHistory:
    """Tests for Conversation.get_history() method."""

    def test_get_history_returns_all_messages_when_under_limit(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )
        conversation.ask_question(
            message_id=MessageId(uuid4()),
            question=Question(content="Question 1"),
        )
        conversation.ask_question(
            message_id=MessageId(uuid4()),
            question=Question(content="Question 2"),
        )

        # Act
        result = conversation.get_history(limit=10)

        # Assert
        assert len(result) == 2

    def test_get_history_returns_last_n_messages(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )
        for i in range(15):
            conversation.ask_question(
                message_id=MessageId(uuid4()),
                question=Question(content=f"Question {i}"),
            )

        # Act
        result = conversation.get_history(limit=10)

        # Assert
        assert len(result) == 10
        assert result[0].question.content == "Question 5"  # Last 10, starting from 5
        assert result[-1].question.content == "Question 14"

    def test_get_history_with_default_limit(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )
        for _ in range(15):
            conversation.ask_question(
                message_id=MessageId(uuid4()),
                question=Question(content="Question"),
            )

        # Act
        result = conversation.get_history()

        # Assert
        assert len(result) == 10  # Default limit is 10

    def test_get_history_on_empty_conversation(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )

        # Act
        result = conversation.get_history(limit=10)

        # Assert
        assert result == []

    def test_get_history_on_closed_conversation(self) -> None:
        # Arrange
        conversation = Conversation.create(
            conversation_id=ConversationId(uuid4()),
            user_id=UserId(uuid4()),
            lesson_id=LessonId(uuid4()),
            events_collection=EventsCollection(events=deque()),
        )
        conversation.ask_question(
            message_id=MessageId(uuid4()),
            question=Question(content="Question"),
        )
        conversation.close()

        # Act
        result = conversation.get_history(limit=10)

        # Assert
        assert len(result) == 1  # Can still get history from closed conversation
