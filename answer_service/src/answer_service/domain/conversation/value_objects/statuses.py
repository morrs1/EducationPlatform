from enum import StrEnum, auto


class ConversationStatus(StrEnum):
    ACTIVE = auto()
    CLOSED = auto()


class MessageStatus(StrEnum):
    PENDING = auto()
    COMPLETED = auto()
    FAILED = auto()
