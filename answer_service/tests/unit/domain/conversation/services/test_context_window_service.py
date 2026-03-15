from uuid import uuid4

import pytest

from answer_service.domain.conversation.entities.conversation import Conversation
from answer_service.domain.conversation.services.context_window_service import (
    ContextWindowService,
)
from answer_service.domain.conversation.value_objects.answer import Answer
from answer_service.domain.conversation.value_objects.message_id import MessageId
from answer_service.domain.conversation.value_objects.model_name import ModelName
from answer_service.domain.conversation.value_objects.question import Question
from answer_service.domain.conversation.value_objects.token_usage import TokenUsage
from tests.unit.factories.entities import make_conversation


@pytest.fixture()
def service() -> ContextWindowService:
    return ContextWindowService()


def _make_answer() -> Answer:
    return Answer(
        content="Answer content.",
        token_usage=TokenUsage(input_tokens=10, output_tokens=5),
        model_name=ModelName(value="gpt-4o"),
    )


def _add_completed_message(
    conversation: Conversation, question_text: str = "Hello?"
) -> None:
    msg = conversation.ask_question(
        MessageId(uuid4()),
        Question(content=question_text),
    )
    conversation.set_answer(MessageId(msg.id), _make_answer())


def test_select_for_context_returns_only_completed_messages(
    service: ContextWindowService,
) -> None:
    # Arrange
    conversation = make_conversation()
    _add_completed_message(conversation)
    conversation.ask_question(MessageId(uuid4()), Question(content="Pending question?"))

    # Act
    result = service.select_for_context(conversation)

    # Assert
    assert len(result) == 1


def test_select_for_context_respects_max_messages(
    service: ContextWindowService,
) -> None:
    # Arrange
    conversation = make_conversation()
    for i in range(5):
        _add_completed_message(conversation, question_text=f"Question {i}?")

    # Act
    result = service.select_for_context(conversation, max_messages=2)

    # Assert
    assert len(result) == 2


def test_select_for_context_empty_conversation(
    service: ContextWindowService,
) -> None:
    # Arrange
    conversation = make_conversation()

    # Act
    result = service.select_for_context(conversation)

    # Assert
    assert result == []


def test_estimate_tokens_uses_chars_per_4_heuristic(
    service: ContextWindowService,
) -> None:
    # Arrange
    question_text = "A" * 40
    answer_text = "B" * 20
    conversation = make_conversation()
    msg = conversation.ask_question(MessageId(uuid4()), Question(content=question_text))
    answer = Answer(
        content=answer_text,
        token_usage=TokenUsage(input_tokens=10, output_tokens=5),
        model_name=ModelName(value="gpt-4o"),
    )
    conversation.set_answer(MessageId(msg.id), answer)
    messages = service.select_for_context(conversation)

    # Act
    result = service.estimate_tokens(messages)

    # Assert
    expected = (len(question_text) + len(answer_text)) // 4
    assert result == expected


def test_select_within_token_budget_respects_budget(
    service: ContextWindowService,
) -> None:
    # Arrange
    conversation = make_conversation()
    for i in range(3):
        _add_completed_message(conversation, question_text=f"Question {i}?")
    all_messages = service.select_for_context(conversation)
    single_cost = service.estimate_tokens([all_messages[0]])
    tight_budget = single_cost

    # Act
    result = service.select_within_token_budget(conversation, token_budget=tight_budget)

    # Assert
    assert len(result) < len(all_messages)


def test_select_within_token_budget_empty_when_zero_budget(
    service: ContextWindowService,
) -> None:
    # Arrange
    conversation = make_conversation()
    _add_completed_message(conversation)

    # Act
    result = service.select_within_token_budget(conversation, token_budget=0)

    # Assert
    assert result == []
