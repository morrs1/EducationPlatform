"""Tests for Answer value object."""

import pytest

from answer_service.domain.common.errors import DomainFieldError
from answer_service.domain.conversation.errors import EmptyAnswerError
from answer_service.domain.conversation.value_objects.answer import Answer
from answer_service.domain.conversation.value_objects.model_name import ModelName
from answer_service.domain.conversation.value_objects.token_usage import TokenUsage


class TestAnswerValidation:
    """Tests for Answer value object validation."""

    @pytest.mark.parametrize(
        ("content", "input_tokens", "output_tokens", "model_name"),
        (
            pytest.param("42 is the answer.", 100, 10, "gpt-4", id="simple_answer"),
            pytest.param(
                "Python is a high-level programming language.",
                50,
                20,
                "claude-3-opus",
                id="technical_answer",
            ),
            pytest.param("a" * 1000, 500, 100, "gemini-pro", id="long_answer"),
            pytest.param(
                "Answer with\nnewlines", 10, 5, "llama-2", id="answer_with_newlines"
            ),
            pytest.param(
                "Answer with\ttabs", 10, 5, "gpt-4-turbo", id="answer_with_tabs"
            ),
            pytest.param("Ответ на русском", 20, 10, "gpt-4", id="cyrillic_answer"),
            pytest.param("中文回答", 15, 8, "gemini-pro", id="chinese_answer"),
        ),
    )
    def test_accepts_valid_answer(
        self,
        content: str,
        input_tokens: int,
        output_tokens: int,
        model_name: str,
    ) -> None:
        # Arrange & Act
        sut = Answer(
            content=content,
            token_usage=TokenUsage(
                input_tokens=input_tokens, output_tokens=output_tokens
            ),
            model_name=ModelName(value=model_name),
        )

        # Assert
        assert sut.content == content
        assert sut.token_usage.input_tokens == input_tokens
        assert sut.token_usage.output_tokens == output_tokens
        assert sut.model_name.value == model_name
        assert str(sut) == content

    @pytest.mark.parametrize(
        ("content", "expected_error"),
        (
            pytest.param("", EmptyAnswerError, id="empty_string"),
            pytest.param("   ", EmptyAnswerError, id="whitespace_only"),
            pytest.param("\n", EmptyAnswerError, id="newline_only"),
            pytest.param("\t", EmptyAnswerError, id="tab_only"),
        ),
    )
    def test_rejects_invalid_answer_content(
        self,
        content: str,
        expected_error: type[DomainFieldError],
    ) -> None:
        # Arrange & Act & Assert
        with pytest.raises(expected_error):
            Answer(
                content=content,
                token_usage=TokenUsage(input_tokens=10, output_tokens=5),
                model_name=ModelName(value="gpt-4"),
            )


class TestAnswerEquality:
    """Tests for Answer equality and hashing."""

    def test_answers_with_same_values_are_equal(self) -> None:
        # Arrange
        a1 = Answer(
            content="Same answer",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )
        a2 = Answer(
            content="Same answer",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )

        # Assert
        assert a1 == a2

    def test_answers_with_different_content_are_not_equal(self) -> None:
        # Arrange
        a1 = Answer(
            content="Answer 1",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )
        a2 = Answer(
            content="Answer 2",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )

        # Assert
        assert a1 != a2

    def test_answers_with_different_token_usage_are_not_equal(self) -> None:
        # Arrange
        a1 = Answer(
            content="Same",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )
        a2 = Answer(
            content="Same",
            token_usage=TokenUsage(input_tokens=200, output_tokens=20),
            model_name=ModelName(value="gpt-4"),
        )

        # Assert
        assert a1 != a2

    def test_answers_with_different_model_are_not_equal(self) -> None:
        # Arrange
        a1 = Answer(
            content="Same",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )
        a2 = Answer(
            content="Same",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="claude-3"),
        )

        # Assert
        assert a1 != a2

    def test_answers_with_same_values_have_same_hash(self) -> None:
        # Arrange
        a1 = Answer(
            content="Same",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )
        a2 = Answer(
            content="Same",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )

        # Assert
        assert hash(a1) == hash(a2)

    def test_answer_can_be_used_in_set(self) -> None:
        # Arrange
        a1 = Answer(
            content="Same",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )
        a2 = Answer(
            content="Same",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )
        a3 = Answer(
            content="Different",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )

        # Act
        result_set = {a1, a2, a3}

        # Assert
        assert len(result_set) == 2

    def test_answer_can_be_used_as_dict_key(self) -> None:
        # Arrange
        a1 = Answer(
            content="Answer 1",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )
        a2 = Answer(
            content="Answer 2",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )

        # Act
        result_dict = {a1: "first", a2: "second"}

        # Assert
        assert result_dict[a1] == "first"
        assert result_dict[a2] == "second"


class TestAnswerImmutability:
    """Tests for Answer immutability."""

    def test_answer_is_immutable(self) -> None:
        # Arrange
        sut = Answer(
            content="Original",
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )

        # Act & Assert
        with pytest.raises(AttributeError):
            sut.content = "Modified"  # type: ignore[misc]

        with pytest.raises(AttributeError):
            sut.token_usage = TokenUsage(input_tokens=200, output_tokens=20)  # type: ignore[misc]

        with pytest.raises(AttributeError):
            sut.model_name = ModelName(value="claude-3")  # type: ignore[misc]


class TestAnswerStrRepresentation:
    """Tests for Answer string representation."""

    def test_str_returns_content(self) -> None:
        # Arrange
        content = "This is the answer content"
        sut = Answer(
            content=content,
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )

        # Act
        result = str(sut)

        # Assert
        assert result == content

    def test_str_preserves_content_formatting(self) -> None:
        # Arrange
        content = "Answer with\nnewlines and\ttabs"
        sut = Answer(
            content=content,
            token_usage=TokenUsage(input_tokens=100, output_tokens=10),
            model_name=ModelName(value="gpt-4"),
        )

        # Act
        result = str(sut)

        # Assert
        assert result == content
