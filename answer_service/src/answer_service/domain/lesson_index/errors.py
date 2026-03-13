from answer_service.domain.common.errors import DomainError, DomainFieldError


class LessonIndexDomainError(DomainError):
    """Base error for the lesson_index domain."""


class LessonAlreadyIndexingError(LessonIndexDomainError):
    """Raised when trying to start indexing a lesson that is already being indexed."""


class LessonNotInIndexingStateError(LessonIndexDomainError):
    """Raised when an operation requires INDEXING state but the index is in another state."""


class EmptyChunkContentError(DomainFieldError):
    """Raised when a chunk content is empty."""


class ChunkContentTooLongError(DomainFieldError):
    """Raised when chunk content exceeds the maximum allowed length."""


class EmptyEmbeddingError(DomainFieldError):
    """Raised when an embedding vector is empty."""
