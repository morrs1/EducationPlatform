import pytest

from answer_service.domain.lesson_index.services.text_splitter_service import (
    TextSplitterService,
)
from answer_service.domain.lesson_index.value_objects.chunk_content import (
    MAX_CHUNK_LENGTH,
    ChunkContent,
)


@pytest.fixture()
def service() -> TextSplitterService:
    return TextSplitterService()


def test_split_empty_text_returns_empty_list(service: TextSplitterService) -> None:
    # Arrange & Act
    result = service.split("")

    # Assert
    assert result == []


def test_split_whitespace_only_returns_empty_list(service: TextSplitterService) -> None:
    # Arrange & Act
    result = service.split("   \n  ")

    # Assert
    assert result == []


def test_split_short_text_returns_single_chunk(service: TextSplitterService) -> None:
    # Arrange
    text = "Short text that fits in one chunk."

    # Act
    result = service.split(text)

    # Assert
    assert len(result) == 1


def test_split_long_text_produces_multiple_chunks(service: TextSplitterService) -> None:
    # Arrange
    text = "a" * 3000

    # Act
    result = service.split(text, chunk_size=1000, chunk_overlap=0)

    # Assert
    assert len(result) >= 3


def test_split_chunks_are_chunk_content_instances(service: TextSplitterService) -> None:
    # Arrange
    text = "Some lesson text to be split into chunks."

    # Act
    result = service.split(text)

    # Assert
    assert all(isinstance(chunk, ChunkContent) for chunk in result)


def test_split_invalid_chunk_size_zero_raises(service: TextSplitterService) -> None:
    # Arrange & Act & Assert
    with pytest.raises(ValueError):
        service.split("text", chunk_size=0)


def test_split_invalid_chunk_size_negative_raises(service: TextSplitterService) -> None:
    # Arrange & Act & Assert
    with pytest.raises(ValueError):
        service.split("text", chunk_size=-1)


def test_split_invalid_chunk_overlap_negative_raises(
    service: TextSplitterService,
) -> None:
    # Arrange & Act & Assert
    with pytest.raises(ValueError):
        service.split("text", chunk_overlap=-1)


def test_split_overlap_equal_to_size_raises(service: TextSplitterService) -> None:
    # Arrange & Act & Assert
    with pytest.raises(ValueError):
        service.split("text", chunk_size=10, chunk_overlap=10)


def test_split_overlap_greater_than_size_raises(service: TextSplitterService) -> None:
    # Arrange & Act & Assert
    with pytest.raises(ValueError):
        service.split("text", chunk_size=10, chunk_overlap=11)


def test_split_chunk_size_exceeds_max_raises(service: TextSplitterService) -> None:
    # Arrange & Act & Assert
    with pytest.raises(ValueError):
        service.split("text", chunk_size=MAX_CHUNK_LENGTH + 1)


def test_split_with_sentence_boundaries(service: TextSplitterService) -> None:
    # Arrange
    sentence_a = "First sentence is here. "
    sentence_b = "Second sentence follows. "
    sentence_c = "Third sentence ends it. "
    text = sentence_a * 20 + sentence_b * 20 + sentence_c * 20

    # Act
    result = service.split(text, chunk_size=200, chunk_overlap=0)

    # Assert
    assert len(result) > 1
    assert all(isinstance(chunk, ChunkContent) for chunk in result)
