from collections.abc import Hashable
from dataclasses import dataclass

from answer_service.domain.common.entity import Entity
from answer_service.domain.common.events_collection import EventsCollection


@dataclass(eq=False, kw_only=True)
class Aggregate[EntityId: Hashable](Entity[EntityId]):
    events_collection: EventsCollection

