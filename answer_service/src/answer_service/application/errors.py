from answer_service.domain.common.errors import AppError


class ApplicationError(AppError):
    """Base exception class for the application layer."""


class ConversationNotFoundError(ApplicationError):
    """Raised when a requested conversation does not exist."""


class LessonIndexNotFoundError(ApplicationError):
    """Raised when a LessonIndex for the given lesson_id does not exist."""


class LessonAlreadyIndexedError(ApplicationError):
    """Raised when attempting to index a lesson that is already indexed."""


class UserNotFoundError(ApplicationError):
    """Raised when a requested user does not exist."""


class PaginationError(ApplicationError):
    """Raised when pagination parameters are invalid."""
