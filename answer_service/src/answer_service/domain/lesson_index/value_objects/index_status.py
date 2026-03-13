from enum import StrEnum, auto


class IndexStatus(StrEnum):
    PENDING = auto()
    INDEXING = auto()
    READY = auto()
    FAILED = auto()
