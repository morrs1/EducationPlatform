"""Tests for TokenUsage value object."""

import pytest

from answer_service.domain.common.errors import DomainFieldError
from answer_service.domain.conversation.errors import NegativeTokenCountError
from answer_service.domain.conversation.value_objects.token_usage import TokenUsage


class TestTokenUsageValidation:
    """Tests for TokenUsage value object validation."""

    @pytest.mark.parametrize(
        ("input_tokens", "output_tokens"),
        [
            pytest.param(0, 0, id="zero_tokens"),
            pytest.param(10, 5, id="small_counts"),
            pytest.param(100, 200, id="medium_counts"),
            pytest.param(1000000, 500000, id="large_counts"),
            pytest.param(0, 100, id="zero_input"),
            pytest.param(100, 0, id="zero_output"),
        ],
    )
    def test_accepts_valid_token_usage(self, input_tokens: int, output_tokens: int) -> None:
        # Arrange & Act
        sut = TokenUsage(input_tokens=input_tokens, output_tokens=output_tokens)

        # Assert
        assert sut.input_tokens == input_tokens
        assert sut.output_tokens == output_tokens
        assert sut.total_tokens == input_tokens + output_tokens

    @pytest.mark.parametrize(
        ("input_tokens", "output_tokens", "expected_error"),
        [
            pytest.param(-1, 0, NegativeTokenCountError, id="negative_input"),
            pytest.param(0, -1, NegativeTokenCountError, id="negative_output"),
            pytest.param(-100, 50, NegativeTokenCountError, id="negative_input_positive_output"),
            pytest.param(50, -100, NegativeTokenCountError, id="positive_input_negative_output"),
            pytest.param(-1, -1, NegativeTokenCountError, id="both_negative"),
        ],
    )
    def test_rejects_negative_token_counts(
        self,
        input_tokens: int,
        output_tokens: int,
        expected_error: type[DomainFieldError],
    ) -> None:
        # Arrange & Act & Assert
        with pytest.raises(expected_error):
            TokenUsage(input_tokens=input_tokens, output_tokens=output_tokens)


class TestTokenUsageTotal:
    """Tests for TokenUsage total_tokens property."""

    def test_total_tokens_is_sum_of_input_and_output(self) -> None:
        # Arrange
        input_tokens = 100
        output_tokens = 50
        sut = TokenUsage(input_tokens=input_tokens, output_tokens=output_tokens)

        # Act
        total = sut.total_tokens

        # Assert
        assert total == 150

    def test_total_tokens_with_zero_values(self) -> None:
        # Arrange
        sut = TokenUsage(input_tokens=0, output_tokens=0)

        # Act
        total = sut.total_tokens

        # Assert
        assert total == 0

    def test_total_tokens_with_large_values(self) -> None:
        # Arrange
        input_tokens = 1_000_000
        output_tokens = 500_000
        sut = TokenUsage(input_tokens=input_tokens, output_tokens=output_tokens)

        # Act
        total = sut.total_tokens

        # Assert
        assert total == 1_500_000


class TestTokenUsageEquality:
    """Tests for TokenUsage equality and hashing."""

    def test_token_usage_with_same_values_are_equal(self) -> None:
        # Arrange
        t1 = TokenUsage(input_tokens=100, output_tokens=50)
        t2 = TokenUsage(input_tokens=100, output_tokens=50)

        # Assert
        assert t1 == t2

    def test_token_usage_with_different_input_are_not_equal(self) -> None:
        # Arrange
        t1 = TokenUsage(input_tokens=100, output_tokens=50)
        t2 = TokenUsage(input_tokens=200, output_tokens=50)

        # Assert
        assert t1 != t2

    def test_token_usage_with_different_output_are_not_equal(self) -> None:
        # Arrange
        t1 = TokenUsage(input_tokens=100, output_tokens=50)
        t2 = TokenUsage(input_tokens=100, output_tokens=100)

        # Assert
        assert t1 != t2

    def test_token_usage_with_same_values_have_same_hash(self) -> None:
        # Arrange
        t1 = TokenUsage(input_tokens=100, output_tokens=50)
        t2 = TokenUsage(input_tokens=100, output_tokens=50)

        # Assert
        assert hash(t1) == hash(t2)

    def test_token_usage_can_be_used_in_set(self) -> None:
        # Arrange
        t1 = TokenUsage(input_tokens=100, output_tokens=50)
        t2 = TokenUsage(input_tokens=100, output_tokens=50)
        t3 = TokenUsage(input_tokens=200, output_tokens=100)

        # Act
        result_set = {t1, t2, t3}

        # Assert
        assert len(result_set) == 2

    def test_token_usage_can_be_used_as_dict_key(self) -> None:
        # Arrange
        t1 = TokenUsage(input_tokens=100, output_tokens=50)
        t2 = TokenUsage(input_tokens=200, output_tokens=100)

        # Act
        result_dict = {t1: "first", t2: "second"}

        # Assert
        assert result_dict[t1] == "first"
        assert result_dict[t2] == "second"


class TestTokenUsageImmutability:
    """Tests for TokenUsage immutability."""

    def test_token_usage_is_immutable(self) -> None:
        # Arrange
        sut = TokenUsage(input_tokens=100, output_tokens=50)

        # Act & Assert
        with pytest.raises(AttributeError):
            sut.input_tokens = 200  # type: ignore[misc]

        with pytest.raises(AttributeError):
            sut.output_tokens = 100  # type: ignore[misc]

    def test_total_tokens_cannot_be_set(self) -> None:
        # Arrange
        sut = TokenUsage(input_tokens=100, output_tokens=50)

        # Act & Assert
        with pytest.raises(AttributeError):
            sut.total_tokens = 300  # type: ignore[misc]


class TestTokenUsageStrRepresentation:
    """Tests for TokenUsage string representation."""

    def test_str_includes_input_tokens(self) -> None:
        # Arrange
        sut = TokenUsage(input_tokens=100, output_tokens=50)

        # Act
        result = str(sut)

        # Assert
        assert "input=100" in result

    def test_str_includes_output_tokens(self) -> None:
        # Arrange
        sut = TokenUsage(input_tokens=100, output_tokens=50)

        # Act
        result = str(sut)

        # Assert
        assert "output=50" in result

    def test_str_includes_total_tokens(self) -> None:
        # Arrange
        sut = TokenUsage(input_tokens=100, output_tokens=50)

        # Act
        result = str(sut)

        # Assert
        assert "total=150" in result

    def test_str_format(self) -> None:
        # Arrange
        sut = TokenUsage(input_tokens=100, output_tokens=50)

        # Act
        result = str(sut)

        # Assert
        assert result == "TokenUsage(input=100, output=50, total=150)"
