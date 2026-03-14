"""Tests for ChunkContent value object."""

import pytest

from answer_service.domain.common.errors import DomainFieldError
from answer_service.domain.lesson_index.errors import (
    ChunkContentTooLongError,
    EmptyChunkContentError,
)
from answer_service.domain.lesson_index.value_objects.chunk_content import (
    MAX_CHUNK_LENGTH,
    ChunkContent,
)


class TestChunkContentValidation:
    """Tests for ChunkContent value object validation."""

    @pytest.mark.parametrize(
        "content",
        [
            pytest.param("Simple chunk content", id="simple_content"),
            pytest.param("Chunk with technical content about Python programming", id="technical_content"),
            pytest.param("a" * MAX_CHUNK_LENGTH, id="max_length_content"),
            pytest.param("Content with spaces   ", id="trailing_spaces"),
            pytest.param("  Content with leading spaces", id="leading_spaces"),
            pytest.param("Content with\nnewlines", id="with_newlines"),
            pytest.param("Content with\ttabs", id="with_tabs"),
            pytest.param("Контент на русском", id="cyrillic"),
            pytest.param("中文内容", id="chinese"),
            pytest.param("日本語のコンテンツ", id="japanese"),
            pytest.param("Content with special chars: @#$%", id="special_chars"),
            pytest.param("Content with numbers: 12345", id="with_numbers"),
            pytest.param("Content with **markdown** formatting", id="with_markdown"),
            pytest.param("Content with <html> tags", id="with_html"),
        ],
    )
    def test_accepts_valid_chunk_content(self, content: str) -> None:
        # Arrange & Act
        sut = ChunkContent(content=content)

        # Assert
        assert sut.content == content
        assert str(sut) == content

    @pytest.mark.parametrize(
        ("content", "expected_error"),
        [
            pytest.param("", EmptyChunkContentError, id="empty_string"),
            pytest.param("   ", EmptyChunkContentError, id="whitespace_only"),
            pytest.param("\n", EmptyChunkContentError, id="newline_only"),
            pytest.param("\t", EmptyChunkContentError, id="tab_only"),
            pytest.param("a" * (MAX_CHUNK_LENGTH + 1), ChunkContentTooLongError, id="exceeds_max_by_one"),
            pytest.param("a" * (MAX_CHUNK_LENGTH * 2), ChunkContentTooLongError, id="exceeds_max_greatly"),
        ],
    )
    def test_rejects_invalid_chunk_content(
        self,
        content: str,
        expected_error: type[DomainFieldError],
    ) -> None:
        # Arrange & Act & Assert
        with pytest.raises(expected_error):
            ChunkContent(content=content)


class TestChunkContentEquality:
    """Tests for ChunkContent equality and hashing."""

    def test_chunk_contents_with_same_content_are_equal(self) -> None:
        # Arrange
        content = "Same content"
        c1 = ChunkContent(content=content)
        c2 = ChunkContent(content=content)

        # Assert
        assert c1 == c2

    def test_chunk_contents_with_different_content_are_not_equal(self) -> None:
        # Arrange
        c1 = ChunkContent(content="Content 1")
        c2 = ChunkContent(content="Content 2")

        # Assert
        assert c1 != c2

    def test_chunk_contents_with_same_content_have_same_hash(self) -> None:
        # Arrange
        content = "Same content"
        c1 = ChunkContent(content=content)
        c2 = ChunkContent(content=content)

        # Assert
        assert hash(c1) == hash(c2)

    def test_chunk_content_can_be_used_in_set(self) -> None:
        # Arrange
        c1 = ChunkContent(content="Test")
        c2 = ChunkContent(content="Test")
        c3 = ChunkContent(content="Different")

        # Act
        result_set = {c1, c2, c3}

        # Assert
        assert len(result_set) == 2

    def test_chunk_content_can_be_used_as_dict_key(self) -> None:
        # Arrange
        c1 = ChunkContent(content="key1")
        c2 = ChunkContent(content="key2")

        # Act
        result_dict = {c1: "value1", c2: "value2"}

        # Assert
        assert result_dict[c1] == "value1"
        assert result_dict[c2] == "value2"


class TestChunkContentImmutability:
    """Tests for ChunkContent immutability."""

    def test_chunk_content_is_immutable(self) -> None:
        # Arrange
        sut = ChunkContent(content="Original")

        # Act & Assert
        with pytest.raises(AttributeError):
            sut.content = "Modified"  # type: ignore[misc]

    def test_chunk_content_cannot_be_modified_after_creation(self) -> None:
        # Arrange
        original_content = "Original content"
        sut = ChunkContent(content=original_content)

        # Act & Assert
        assert sut.content == original_content
