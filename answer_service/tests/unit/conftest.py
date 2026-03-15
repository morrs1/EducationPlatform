"""Shared fixtures for unit tests."""

from collections import deque

import pytest

from answer_service.domain.common.events_collection import EventsCollection


@pytest.fixture()
def events_collection() -> EventsCollection:
    """Create an empty events collection for tests."""
    return EventsCollection(events=deque())
