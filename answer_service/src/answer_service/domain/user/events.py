from dataclasses import dataclass

from answer_service.domain.common.events import Event
from answer_service.domain.user.value_objects.user_id import UserId


@dataclass(frozen=True, kw_only=True)
class UserRegistered(Event):
    """Raised when a user is first seen and registered within this bounded context."""

    user_id: UserId
