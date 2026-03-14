"""Tests for ModelName value object."""

import pytest

from answer_service.domain.common.errors import DomainFieldError
from answer_service.domain.conversation.errors import EmptyModelNameError
from answer_service.domain.conversation.value_objects.model_name import ModelName


class TestModelNameValidation:
    """Tests for ModelName value object validation."""

    @pytest.mark.parametrize(
        "value",
        [
            pytest.param("gpt-4", id="simple_name"),
            pytest.param("gpt-4-turbo-preview", id="name_with_hyphens"),
            pytest.param("gpt-4o", id="name_with_letter_suffix"),
            pytest.param("claude-3-opus-20240229", id="claude_model"),
            pytest.param("gemini-pro", id="gemini_model"),
            pytest.param("llama-2-70b-chat", id="llama_model"),
            pytest.param("model_123", id="name_with_underscore"),
            pytest.param("model.v1", id="name_with_dot"),
            pytest.param("GPT-4", id="uppercase"),
            pytest.param("MixedCase-Model", id="mixed_case"),
            pytest.param("a", id="single_char"),
            pytest.param("very-long-model-name-with-many-parts-and-versions", id="long_name"),
        ],
    )
    def test_accepts_valid_model_name(self, value: str) -> None:
        # Arrange & Act
        sut = ModelName(value=value)

        # Assert
        assert sut.value == value
        assert str(sut) == value

    @pytest.mark.parametrize(
        ("value", "expected_error"),
        [
            pytest.param("", EmptyModelNameError, id="empty_string"),
            pytest.param("   ", EmptyModelNameError, id="whitespace_only"),
            pytest.param("\n", EmptyModelNameError, id="newline_only"),
            pytest.param("\t", EmptyModelNameError, id="tab_only"),
        ],
    )
    def test_rejects_invalid_model_name(
        self,
        value: str,
        expected_error: type[DomainFieldError],
    ) -> None:
        # Arrange & Act & Assert
        with pytest.raises(expected_error):
            ModelName(value=value)


class TestModelNameEquality:
    """Tests for ModelName equality and hashing."""

    def test_model_names_with_same_value_are_equal(self) -> None:
        # Arrange
        m1 = ModelName(value="gpt-4")
        m2 = ModelName(value="gpt-4")

        # Assert
        assert m1 == m2

    def test_model_names_with_different_values_are_not_equal(self) -> None:
        # Arrange
        m1 = ModelName(value="gpt-4")
        m2 = ModelName(value="claude-3")

        # Assert
        assert m1 != m2

    def test_model_names_with_same_value_have_same_hash(self) -> None:
        # Arrange
        m1 = ModelName(value="gpt-4")
        m2 = ModelName(value="gpt-4")

        # Assert
        assert hash(m1) == hash(m2)

    def test_model_name_can_be_used_in_set(self) -> None:
        # Arrange
        m1 = ModelName(value="gpt-4")
        m2 = ModelName(value="gpt-4")
        m3 = ModelName(value="claude-3")

        # Act
        result_set = {m1, m2, m3}

        # Assert
        assert len(result_set) == 2

    def test_model_name_can_be_used_as_dict_key(self) -> None:
        # Arrange
        m1 = ModelName(value="gpt-4")
        m2 = ModelName(value="claude-3")

        # Act
        result_dict = {m1: "openai", m2: "anthropic"}

        # Assert
        assert result_dict[m1] == "openai"
        assert result_dict[m2] == "anthropic"


class TestModelNameImmutability:
    """Tests for ModelName immutability."""

    def test_model_name_is_immutable(self) -> None:
        # Arrange
        sut = ModelName(value="gpt-4")

        # Act & Assert
        with pytest.raises(AttributeError):
            sut.value = "claude-3"  # type: ignore[misc]

    def test_model_name_value_cannot_be_modified_after_creation(self) -> None:
        # Arrange
        original_value = "gpt-4"
        sut = ModelName(value=original_value)

        # Act & Assert
        assert sut.value == original_value


class TestModelNameStrRepresentation:
    """Tests for ModelName string representation."""

    def test_str_returns_value(self) -> None:
        # Arrange
        value = "gpt-4-turbo"
        sut = ModelName(value=value)

        # Act
        result = str(sut)

        # Assert
        assert result == value

    def test_str_preserves_case(self) -> None:
        # Arrange
        value = "GPT-4-MixedCase"
        sut = ModelName(value=value)

        # Act
        result = str(sut)

        # Assert
        assert result == value
