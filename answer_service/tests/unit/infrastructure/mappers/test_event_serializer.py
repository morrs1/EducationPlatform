"""Unit tests for RetortEventSerializer."""

import json
from dataclasses import dataclass
from uuid import UUID, uuid4

import pytest

from answer_service.domain.common.events import Event
from answer_service.domain.user.value_objects.user_id import UserId
from answer_service.infrastructure.mappers.event_serializer import RetortEventSerializer


@dataclass(frozen=True, kw_only=True)
class _SampleEvent(Event):
    user_id: UserId


@pytest.fixture()
def serializer() -> RetortEventSerializer:
    return RetortEventSerializer()


def test_serialize_returns_outbox_message_with_correct_event_type(
    serializer: RetortEventSerializer,
) -> None:
    # Arrange
    event = _SampleEvent(user_id=UserId(uuid4()))

    # Act
    message = serializer.serialize(event)

    # Assert
    assert message.event_type == "_SampleEvent"


def test_serialize_stamps_event_id_and_event_date(
    serializer: RetortEventSerializer,
) -> None:
    # Arrange
    event = _SampleEvent(user_id=UserId(uuid4()))
    assert event.event_id is None
    assert event.event_date is None

    # Act
    serializer.serialize(event)

    # Assert
    assert event.event_id is not None
    assert event.event_date is not None


def test_serialize_does_not_overwrite_existing_event_id(
    serializer: RetortEventSerializer,
) -> None:
    # Arrange
    event = _SampleEvent(user_id=UserId(uuid4()))
    serializer.serialize(event)
    first_id = event.event_id

    # Act — serialize again
    serializer.serialize(event)

    # Assert — event_id unchanged
    assert event.event_id == first_id


def test_serialize_payload_is_valid_json(
    serializer: RetortEventSerializer,
) -> None:
    # Arrange
    event = _SampleEvent(user_id=UserId(uuid4()))

    # Act
    message = serializer.serialize(event)

    # Assert
    data = json.loads(message.payload)
    assert isinstance(data, dict)


def test_serialize_uuid_fields_are_strings_in_payload(
    serializer: RetortEventSerializer,
) -> None:
    # Arrange
    user_id = UserId(uuid4())
    event = _SampleEvent(user_id=user_id)

    # Act
    message = serializer.serialize(event)
    data = json.loads(message.payload)

    # Assert
    assert isinstance(data["user_id"], str)
    assert data["user_id"] == str(user_id)


def test_serialize_datetime_fields_are_iso_strings_in_payload(
    serializer: RetortEventSerializer,
) -> None:
    # Arrange
    event = _SampleEvent(user_id=UserId(uuid4()))

    # Act
    message = serializer.serialize(event)
    data = json.loads(message.payload)

    # Assert — event_date is ISO string, not a datetime object
    assert isinstance(data["event_date"], str)


def test_serialize_message_id_is_uuid(
    serializer: RetortEventSerializer,
) -> None:
    # Arrange
    event = _SampleEvent(user_id=UserId(uuid4()))

    # Act
    message = serializer.serialize(event)

    # Assert
    assert isinstance(message.id, UUID)


def test_serialize_created_at_is_set(
    serializer: RetortEventSerializer,
) -> None:
    # Arrange
    event = _SampleEvent(user_id=UserId(uuid4()))

    # Act
    message = serializer.serialize(event)

    # Assert
    assert message.created_at is not None
    assert message.processed_at is None
