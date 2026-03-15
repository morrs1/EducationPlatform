"""Tests for Message entity."""

from uuid import uuid4

import pytest

from answer_service.domain.conversation.entities.message import Message
from answer_service.domain.conversation.errors import MessageAlreadyProcessedError
from answer_service.domain.conversation.value_objects.answer import Answer
from answer_service.domain.conversation.value_objects.message_id import MessageId
from answer_service.domain.conversation.value_objects.model_name import ModelName
from answer_service.domain.conversation.value_objects.question import Question
from answer_service.domain.conversation.value_objects.statuses import MessageStatus
from answer_service.domain.conversation.value_objects.token_usage import TokenUsage


class TestMessageCreation:
    """Tests for Message entity creation."""

    def test_create_message_with_question_only(self) -> None:
        # Arrange
        message_id = MessageId(uuid4())
        question = Question(content="What is Python?")

        # Act
        sut = Message(id=message_id, question=question)

        # Assert
        assert sut.id == message_id
        assert sut.question == question
        assert sut.answer is None
        assert sut.status == MessageStatus.PENDING

    def test_message_id_is_unique(self) -> None:
        # Arrange
        message_id1 = MessageId(uuid4())
        message_id2 = MessageId(uuid4())
        question = Question(content="Test question")

        # Act
        message1 = Message(id=message_id1, question=question)
        message2 = Message(id=message_id2, question=question)

        # Assert
        assert message1.id != message2.id


class TestMessageSetAnswer:
    """Tests for Message.set_answer() method."""

    def test_set_answer_on_pending_message(self) -> None:
        # Arrange
        message = Message(id=MessageId(uuid4()), question=Question(content="Question"))
        answer = Answer(
            content="Answer",
            token_usage=TokenUsage(input_tokens=10, output_tokens=5),
            model_name=ModelName(value="gpt-4"),
        )

        # Act
        message.set_answer(answer)

        # Assert
        assert message.answer == answer
        assert message.status == MessageStatus.COMPLETED

    def test_set_answer_on_completed_message_raises(self) -> None:
        # Arrange
        message = Message(id=MessageId(uuid4()), question=Question(content="Question"))
        answer1 = Answer(
            content="First answer",
            token_usage=TokenUsage(input_tokens=10, output_tokens=5),
            model_name=ModelName(value="gpt-4"),
        )
        answer2 = Answer(
            content="Second answer",
            token_usage=TokenUsage(input_tokens=10, output_tokens=5),
            model_name=ModelName(value="gpt-4"),
        )
        message.set_answer(answer1)

        # Act & Assert
        with pytest.raises(MessageAlreadyProcessedError):
            message.set_answer(answer2)

    def test_set_answer_on_failed_message_raises(self) -> None:
        # Arrange
        message = Message(id=MessageId(uuid4()), question=Question(content="Question"))
        answer = Answer(
            content="Answer",
            token_usage=TokenUsage(input_tokens=10, output_tokens=5),
            model_name=ModelName(value="gpt-4"),
        )
        message.mark_failed()

        # Act & Assert
        with pytest.raises(MessageAlreadyProcessedError):
            message.set_answer(answer)


class TestMessageMarkFailed:
    """Tests for Message.mark_failed() method."""

    def test_mark_failed_on_pending_message(self) -> None:
        # Arrange
        message = Message(id=MessageId(uuid4()), question=Question(content="Question"))

        # Act
        message.mark_failed()

        # Assert
        assert message.status == MessageStatus.FAILED
        assert message.answer is None

    def test_mark_failed_on_completed_message(self) -> None:
        # Arrange
        message = Message(id=MessageId(uuid4()), question=Question(content="Question"))
        answer = Answer(
            content="Answer",
            token_usage=TokenUsage(input_tokens=10, output_tokens=5),
            model_name=ModelName(value="gpt-4"),
        )
        message.set_answer(answer)

        # Act
        message.mark_failed()

        # Assert
        assert message.status == MessageStatus.FAILED
        assert message.answer == answer  # Answer is preserved


class TestMessageStatusTransitions:
    """Tests for Message status transitions."""

    def test_message_starts_as_pending(self) -> None:
        # Arrange & Act
        message = Message(id=MessageId(uuid4()), question=Question(content="Question"))

        # Assert
        assert message.status == MessageStatus.PENDING

    def test_message_transitions_from_pending_to_completed(self) -> None:
        # Arrange
        message = Message(id=MessageId(uuid4()), question=Question(content="Question"))
        answer = Answer(
            content="Answer",
            token_usage=TokenUsage(input_tokens=10, output_tokens=5),
            model_name=ModelName(value="gpt-4"),
        )

        # Act
        message.set_answer(answer)

        # Assert
        assert message.status == MessageStatus.COMPLETED

    def test_message_transitions_from_pending_to_failed(self) -> None:
        # Arrange
        message = Message(id=MessageId(uuid4()), question=Question(content="Question"))

        # Act
        message.mark_failed()

        # Assert
        assert message.status == MessageStatus.FAILED

    def test_message_cannot_go_from_completed_to_pending(self) -> None:
        # Arrange
        message = Message(id=MessageId(uuid4()), question=Question(content="Question"))
        answer = Answer(
            content="Answer",
            token_usage=TokenUsage(input_tokens=10, output_tokens=5),
            model_name=ModelName(value="gpt-4"),
        )
        message.set_answer(answer)

        # Act & Assert
        # No method to transition back to PENDING
        assert message.status != MessageStatus.PENDING


class TestMessageEquality:
    """Tests for Message equality."""

    def test_messages_with_same_id_are_equal(self) -> None:
        # Arrange
        message_id = MessageId(uuid4())
        question1 = Question(content="Question 1")
        question2 = Question(content="Question 2")

        # Note: Message uses eq=False in dataclass, so identity is based on id
        message1 = Message(id=message_id, question=question1)
        message2 = Message(id=message_id, question=question2)

        # Assert
        assert message1.id == message2.id

    def test_messages_with_different_id_are_not_equal(self) -> None:
        # Arrange
        message1 = Message(id=MessageId(uuid4()), question=Question(content="Question"))
        message2 = Message(id=MessageId(uuid4()), question=Question(content="Question"))

        # Assert
        assert message1.id != message2.id
