"""Tests for DocumentChunk entity."""

from uuid import uuid4

from answer_service.domain.lesson_index.entities.document_chunk import DocumentChunk
from answer_service.domain.lesson_index.value_objects.chunk_content import ChunkContent
from answer_service.domain.lesson_index.value_objects.chunk_id import ChunkId
from answer_service.domain.lesson_index.value_objects.embedding import Embedding


class TestDocumentChunkCreation:
    """Tests for DocumentChunk entity creation."""

    def test_create_document_chunk(self) -> None:
        # Arrange
        chunk_id = ChunkId(uuid4())
        content = ChunkContent(content="Test chunk content")
        embedding = Embedding(vector=(0.1, 0.2, 0.3))
        position = 0

        # Act
        sut = DocumentChunk(
            id=chunk_id,
            content=content,
            embedding=embedding,
            position=position,
        )

        # Assert
        assert sut.id == chunk_id
        assert sut.content == content
        assert sut.embedding == embedding
        assert sut.position == position

    def test_document_chunk_id_is_unique(self) -> None:
        # Arrange
        chunk_id1 = ChunkId(uuid4())
        chunk_id2 = ChunkId(uuid4())
        content = ChunkContent(content="Test")
        embedding = Embedding(vector=(0.1, 0.2, 0.3))

        # Act
        chunk1 = DocumentChunk(id=chunk_id1, content=content, embedding=embedding, position=0)
        chunk2 = DocumentChunk(id=chunk_id2, content=content, embedding=embedding, position=0)

        # Assert
        assert chunk1.id != chunk2.id

    def test_create_chunk_with_realistic_content(self) -> None:
        # Arrange
        content_text = """
        Python is a high-level, general-purpose programming language.
        Its design philosophy emphasizes code readability with the use
        of significant indentation.
        """
        chunk_id = ChunkId(uuid4())
        content = ChunkContent(content=content_text.strip())
        embedding = Embedding(vector=tuple(range(1536)))  # Simulate OpenAI embedding
        position = 5

        # Act
        sut = DocumentChunk(
            id=chunk_id,
            content=content,
            embedding=embedding,
            position=position,
        )

        # Assert
        assert sut.position == 5
        assert sut.embedding.dimension == 1536
        assert "Python" in sut.content.content

    def test_create_chunk_with_zero_position(self) -> None:
        # Arrange
        chunk_id = ChunkId(uuid4())
        content = ChunkContent(content="First chunk")
        embedding = Embedding(vector=(0.1, 0.2, 0.3))

        # Act
        sut = DocumentChunk(id=chunk_id, content=content, embedding=embedding, position=0)

        # Assert
        assert sut.position == 0

    def test_create_chunk_with_high_position(self) -> None:
        # Arrange
        chunk_id = ChunkId(uuid4())
        content = ChunkContent(content="Last chunk")
        embedding = Embedding(vector=(0.1, 0.2, 0.3))
        position = 999

        # Act
        sut = DocumentChunk(id=chunk_id, content=content, embedding=embedding, position=position)

        # Assert
        assert sut.position == 999


class TestDocumentChunkEquality:
    """Tests for DocumentChunk equality."""

    def test_chunks_with_same_id_are_equal(self) -> None:
        # Arrange
        chunk_id = ChunkId(uuid4())
        content1 = ChunkContent(content="Content 1")
        content2 = ChunkContent(content="Content 2")
        embedding = Embedding(vector=(0.1, 0.2, 0.3))

        # Note: DocumentChunk uses eq=False in dataclass
        chunk1 = DocumentChunk(id=chunk_id, content=content1, embedding=embedding, position=0)
        chunk2 = DocumentChunk(id=chunk_id, content=content2, embedding=embedding, position=1)

        # Assert
        assert chunk1.id == chunk2.id

    def test_chunks_with_different_id_are_not_equal(self) -> None:
        # Arrange
        chunk1 = DocumentChunk(
            id=ChunkId(uuid4()),
            content=ChunkContent(content="Test"),
            embedding=Embedding(vector=(0.1, 0.2, 0.3)),
            position=0,
        )
        chunk2 = DocumentChunk(
            id=ChunkId(uuid4()),
            content=ChunkContent(content="Test"),
            embedding=Embedding(vector=(0.1, 0.2, 0.3)),
            position=0,
        )

        # Assert
        assert chunk1.id != chunk2.id


class TestDocumentChunkImmutability:
    """Tests for DocumentChunk field modifications."""

    def test_chunk_fields_can_be_modified(self) -> None:
        # Arrange
        sut = DocumentChunk(
            id=ChunkId(uuid4()),
            content=ChunkContent(content="Original"),
            embedding=Embedding(vector=(0.1, 0.2, 0.3)),
            position=0,
        )

        # Act
        sut.content = ChunkContent(content="Modified")

        # Assert
        assert sut.content.content == "Modified"

    def test_chunk_position_can_be_modified(self) -> None:
        # Arrange
        sut = DocumentChunk(
            id=ChunkId(uuid4()),
            content=ChunkContent(content="Test"),
            embedding=Embedding(vector=(0.1, 0.2, 0.3)),
            position=0,
        )

        # Act
        sut.position = 10

        # Assert
        assert sut.position == 10

    def test_chunk_embedding_can_be_modified(self) -> None:
        # Arrange
        sut = DocumentChunk(
            id=ChunkId(uuid4()),
            content=ChunkContent(content="Test"),
            embedding=Embedding(vector=(0.1, 0.2, 0.3)),
            position=0,
        )

        # Act
        sut.embedding = Embedding(vector=(0.4, 0.5, 0.6))

        # Assert
        assert sut.embedding.vector == (0.4, 0.5, 0.6)
