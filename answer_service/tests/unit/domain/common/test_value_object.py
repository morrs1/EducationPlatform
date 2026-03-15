"""Tests for the base ValueObject class."""

from dataclasses import dataclass

import pytest

from answer_service.domain.common.errors import DomainFieldError
from answer_service.domain.common.value_object import ValueObject


@dataclass(frozen=True, kw_only=True)
class _TestValueObject(ValueObject):
    value: str

    def _validate(self) -> None:
        if not self.value:
            msg = "Value cannot be empty"
            raise DomainFieldError(msg)

    def __str__(self) -> str:
        return self.value


@dataclass(frozen=True, kw_only=True)
class _EmptyValueObject(ValueObject):
    """Value object with no fields - should raise error."""

    def _validate(self) -> None:
        pass

    def __str__(self) -> str:
        return ""


class TestValueObjectBase:
    """Tests for ValueObject base class behavior."""

    def test_value_object_requires_at_least_one_field(self) -> None:
        # Arrange & Act & Assert
        with pytest.raises(DomainFieldError, match="must have at least one field"):
            _EmptyValueObject()

    def test_value_object_calls_validate_on_creation(self) -> None:
        # Arrange & Act & Assert
        with pytest.raises(DomainFieldError, match="Value cannot be empty"):
            _TestValueObject(value="")

    def test_value_object_creation_success(self) -> None:
        # Arrange
        value = "test_value"

        # Act
        sut = _TestValueObject(value=value)

        # Assert
        assert sut.value == value

    def test_value_object_is_immutable(self) -> None:
        # Arrange
        sut = _TestValueObject(value="test")

        # Act & Assert
        with pytest.raises(AttributeError):
            sut.value = "new_value"  # type: ignore[misc]

    def test_value_object_equality_same_values(self) -> None:
        # Arrange
        value = "same_value"
        obj1 = _TestValueObject(value=value)
        obj2 = _TestValueObject(value=value)

        # Assert
        assert obj1 == obj2

    def test_value_object_equality_different_values(self) -> None:
        # Arrange
        obj1 = _TestValueObject(value="value1")
        obj2 = _TestValueObject(value="value2")

        # Assert
        assert obj1 != obj2

    def test_value_object_hash_consistency(self) -> None:
        # Arrange
        value = "test_value"
        obj1 = _TestValueObject(value=value)
        obj2 = _TestValueObject(value=value)

        # Assert
        assert hash(obj1) == hash(obj2)
        assert hash(obj1) == hash(obj1)

    def test_value_object_can_be_used_in_set(self) -> None:
        # Arrange
        obj1 = _TestValueObject(value="test")
        obj2 = _TestValueObject(value="test")
        obj3 = _TestValueObject(value="different")

        # Act
        result_set = {obj1, obj2, obj3}

        # Assert
        assert len(result_set) == 2  # obj1 and obj2 are equal

    def test_value_object_can_be_used_as_dict_key(self) -> None:
        # Arrange
        obj1 = _TestValueObject(value="key1")
        obj2 = _TestValueObject(value="key2")

        # Act
        result_dict = {obj1: "value1", obj2: "value2"}

        # Assert
        assert result_dict[obj1] == "value1"
        assert result_dict[obj2] == "value2"

    def test_value_object_str_representation(self) -> None:
        # Arrange
        value = "test_string"
        sut = _TestValueObject(value=value)

        # Act
        result = str(sut)

        # Assert
        assert result == value

    def test_value_object_repr(self) -> None:
        # Arrange
        value = "test_value"
        sut = _TestValueObject(value=value)

        # Assert
        assert repr(sut) is not None
