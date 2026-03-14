"""Tests for Question value object."""

import pytest

from answer_service.domain.common.errors import DomainFieldError
from answer_service.domain.conversation.errors import (
    EmptyQuestionError,
    QuestionTooLongError,
)
from answer_service.domain.conversation.value_objects.question import (
    MAX_QUESTION_LENGTH,
    Question,
)


class TestQuestionValidation:
    """Tests for Question value object validation."""

    @pytest.mark.parametrize(
        "content",
        [
            pytest.param("What is Python?", id="simple_question"),
            pytest.param(
                "How do I use FastAPI with dependency injection?", id="technical_question"
            ),
            pytest.param(
                "Explain the difference between list and tuple", id="comparison_question"
            ),
            pytest.param("a" * MAX_QUESTION_LENGTH, id="max_length_question"),
            pytest.param("Question with spaces   ", id="trailing_spaces"),
            pytest.param("  Question with leading spaces", id="leading_spaces"),
            pytest.param("Question with 'quotes'", id="with_quotes"),
            pytest.param('Question with "double quotes"', id="with_double_quotes"),
            pytest.param("Question with\nnewlines", id="with_newlines"),
            pytest.param("Question with\ttabs", id="with_tabs"),
            pytest.param("Вопрос на русском", id="cyrillic"),
            pytest.param("中文问题", id="chinese"),
            pytest.param("日本語の質問", id="japanese"),
            pytest.param("Question with special chars: @#$%", id="special_chars"),
            pytest.param("Question with numbers: 12345", id="with_numbers"),
        ],
    )
    def test_accepts_valid_question(self, content: str) -> None:
        # Arrange & Act
        sut = Question(content=content)

        # Assert
        assert sut.content == content
        assert str(sut) == content

    @pytest.mark.parametrize(
        ("content", "expected_error"),
        [
            pytest.param("", EmptyQuestionError, id="empty_string"),
            pytest.param("   ", EmptyQuestionError, id="whitespace_only"),
            pytest.param("\n", EmptyQuestionError, id="newline_only"),
            pytest.param("\t", EmptyQuestionError, id="tab_only"),
            pytest.param(
                "a" * (MAX_QUESTION_LENGTH + 1),
                QuestionTooLongError,
                id="exceeds_max_by_one",
            ),
            pytest.param(
                "a" * (MAX_QUESTION_LENGTH * 2),
                QuestionTooLongError,
                id="exceeds_max_greatly",
            ),
        ],
    )
    def test_rejects_invalid_question(
        self, content: str, expected_error: type[DomainFieldError]
    ) -> None:
        # Arrange & Act & Assert
        with pytest.raises(expected_error):
            Question(content=content)


class TestQuestionEquality:
    """Tests for Question equality and hashing."""

    def test_questions_with_same_content_are_equal(self) -> None:
        # Arrange
        content = "Same question"
        q1 = Question(content=content)
        q2 = Question(content=content)

        # Assert
        assert q1 == q2

    def test_questions_with_different_content_are_not_equal(self) -> None:
        # Arrange
        q1 = Question(content="Question 1")
        q2 = Question(content="Question 2")

        # Assert
        assert q1 != q2

    def test_questions_with_same_content_have_same_hash(self) -> None:
        # Arrange
        content = "Same question"
        q1 = Question(content=content)
        q2 = Question(content=content)

        # Assert
        assert hash(q1) == hash(q2)

    def test_question_can_be_used_in_set(self) -> None:
        # Arrange
        q1 = Question(content="Test")
        q2 = Question(content="Test")
        q3 = Question(content="Different")

        # Act
        result_set = {q1, q2, q3}

        # Assert
        assert len(result_set) == 2

    def test_question_can_be_used_as_dict_key(self) -> None:
        # Arrange
        q1 = Question(content="key1")
        q2 = Question(content="key2")

        # Act
        result_dict = {q1: "value1", q2: "value2"}

        # Assert
        assert result_dict[q1] == "value1"
        assert result_dict[q2] == "value2"


class TestQuestionImmutability:
    """Tests for Question immutability."""

    def test_question_is_immutable(self) -> None:
        # Arrange
        sut = Question(content="Original")

        # Act & Assert
        with pytest.raises(AttributeError):
            sut.content = "Modified"  # type: ignore[misc]

    def test_question_content_cannot_be_modified_after_creation(self) -> None:
        # Arrange
        original_content = "Original content"
        sut = Question(content=original_content)

        # Act & Assert
        assert sut.content == original_content
