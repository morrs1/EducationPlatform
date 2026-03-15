from answer_service.domain.common.errors import DomainError, DomainFieldError


class ConversationDomainError(DomainError):
    """Base error for the conversation domain."""


class ConversationClosedError(ConversationDomainError):
    """Raised when attempting to modify a closed conversation."""


class MessageNotFoundError(ConversationDomainError):
    """Raised when a message is not found in the conversation."""


class MessageAlreadyProcessedError(ConversationDomainError):
    """Raised when trying to set an answer on an already processed message."""


class EmptyQuestionError(DomainFieldError):
    """Raised when question content is empty."""


class QuestionTooLongError(DomainFieldError):
    """Raised when question exceeds the maximum allowed length."""


class EmptyAnswerError(DomainFieldError):
    """Raised when answer content is empty."""


class EmptyModelNameError(DomainFieldError):
    """Raised when model name is empty."""


class NegativeTokenCountError(DomainFieldError):
    """Raised when a token count is negative."""
