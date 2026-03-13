from dataclasses import dataclass
from typing import Self, final

from answer_service.domain.common.aggregate import Aggregate
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.user.events import UserRegistered
from answer_service.domain.user.value_objects.user_id import UserId


@final
@dataclass(eq=False, kw_only=True)
class User(Aggregate[UserId]):
    """Represents a user within the answer-service bounded context.

    Stores only answer-service-specific data.
    Identity is provided by UserId issued by the auth/user service.
    """

    @classmethod
    def create(
        cls,
        user_id: UserId,
        events_collection: EventsCollection,
    ) -> Self:
        user = cls(id=user_id, events_collection=events_collection)
        user.events_collection.add_event(UserRegistered(user_id=user_id))
        return user
