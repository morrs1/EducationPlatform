"""Tests for Embedding value object."""


import pytest

from answer_service.domain.common.errors import DomainFieldError
from answer_service.domain.lesson_index.errors import EmptyEmbeddingError
from answer_service.domain.lesson_index.value_objects.embedding import Embedding


class TestEmbeddingValidation:
    """Tests for Embedding value object validation."""

    @pytest.mark.parametrize(
        "vector",
        [
            pytest.param((0.1, 0.2, 0.3), id="small_vector"),
            pytest.param(tuple(range(100)), id="hundred_dimension"),
            pytest.param(tuple(range(1536)), id="openai_embedding_dim"),
            pytest.param((0.0, 0.0, 0.0), id="zero_vector"),
            pytest.param((-0.5, 0.0, 0.5), id="negative_and_positive"),
            pytest.param((1e-10, 1e-5, 1e-2), id="very_small_floats"),
            pytest.param((1e10, 1e5, 1e2), id="very_large_floats"),
        ],
    )
    def test_accepts_valid_embedding(self, vector: tuple[float, ...]) -> None:
        # Arrange & Act
        sut = Embedding(vector=vector)

        # Assert
        assert sut.vector == vector
        assert sut.dimension == len(vector)

    @pytest.mark.parametrize(
        ("vector", "expected_error"),
        [
            pytest.param((), EmptyEmbeddingError, id="empty_tuple"),
        ],
    )
    def test_rejects_invalid_embedding(
        self,
        vector: tuple[float, ...],
        expected_error: type[DomainFieldError],
    ) -> None:
        # Arrange & Act & Assert
        with pytest.raises(expected_error):
            Embedding(vector=vector)


class TestEmbeddingDimension:
    """Tests for Embedding.dimension property."""

    def test_dimension_returns_vector_length(self) -> None:
        # Arrange
        vector = (0.1, 0.2, 0.3, 0.4, 0.5)
        sut = Embedding(vector=vector)

        # Act
        dimension = sut.dimension

        # Assert
        assert dimension == 5

    def test_dimension_with_large_vector(self) -> None:
        # Arrange
        vector = tuple(range(1536))
        sut = Embedding(vector=vector)

        # Act
        dimension = sut.dimension

        # Assert
        assert dimension == 1536

    def test_dimension_with_single_element(self) -> None:
        # Arrange
        vector = (1.0,)
        sut = Embedding(vector=vector)

        # Act
        dimension = sut.dimension

        # Assert
        assert dimension == 1


class TestEmbeddingEquality:
    """Tests for Embedding equality and hashing."""

    def test_embeddings_with_same_vector_are_equal(self) -> None:
        # Arrange
        vector = (0.1, 0.2, 0.3)
        e1 = Embedding(vector=vector)
        e2 = Embedding(vector=vector)

        # Assert
        assert e1 == e2

    def test_embeddings_with_different_vectors_are_not_equal(self) -> None:
        # Arrange
        e1 = Embedding(vector=(0.1, 0.2, 0.3))
        e2 = Embedding(vector=(0.1, 0.2, 0.4))

        # Assert
        assert e1 != e2

    def test_embeddings_with_same_vector_have_same_hash(self) -> None:
        # Arrange
        vector = (0.1, 0.2, 0.3)
        e1 = Embedding(vector=vector)
        e2 = Embedding(vector=vector)

        # Assert
        assert hash(e1) == hash(e2)

    def test_embedding_can_be_used_in_set(self) -> None:
        # Arrange
        e1 = Embedding(vector=(0.1, 0.2, 0.3))
        e2 = Embedding(vector=(0.1, 0.2, 0.3))
        e3 = Embedding(vector=(0.4, 0.5, 0.6))

        # Act
        result_set = {e1, e2, e3}

        # Assert
        assert len(result_set) == 2

    def test_embedding_can_be_used_as_dict_key(self) -> None:
        # Arrange
        e1 = Embedding(vector=(0.1, 0.2, 0.3))
        e2 = Embedding(vector=(0.4, 0.5, 0.6))

        # Act
        result_dict = {e1: "first", e2: "second"}

        # Assert
        assert result_dict[e1] == "first"
        assert result_dict[e2] == "second"


class TestEmbeddingImmutability:
    """Tests for Embedding immutability."""

    def test_embedding_is_immutable(self) -> None:
        # Arrange
        sut = Embedding(vector=(0.1, 0.2, 0.3))

        # Act & Assert
        with pytest.raises(AttributeError):
            sut.vector = (0.4, 0.5, 0.6)  # type: ignore[misc]

    def test_embedding_vector_is_tuple(self) -> None:
        # Arrange
        sut = Embedding(vector=(0.1, 0.2, 0.3))

        # Assert
        assert isinstance(sut.vector, tuple)

    def test_dimension_cannot_be_set(self) -> None:
        # Arrange
        sut = Embedding(vector=(0.1, 0.2, 0.3))

        # Act & Assert
        with pytest.raises(AttributeError):
            sut.dimension = 10  # type: ignore[misc]


class TestEmbeddingStrRepresentation:
    """Tests for Embedding string representation."""

    def test_str_includes_dimension(self) -> None:
        # Arrange
        sut = Embedding(vector=(0.1, 0.2, 0.3))

        # Act
        result = str(sut)

        # Assert
        assert "dim=3" in result

    def test_str_format(self) -> None:
        # Arrange
        sut = Embedding(vector=(0.1, 0.2, 0.3))

        # Act
        result = str(sut)

        # Assert
        assert result == "Embedding(dim=3)"

    def test_str_with_large_dimension(self) -> None:
        # Arrange
        vector = tuple(range(1536))
        sut = Embedding(vector=vector)

        # Act
        result = str(sut)

        # Assert
        assert result == "Embedding(dim=1536)"
