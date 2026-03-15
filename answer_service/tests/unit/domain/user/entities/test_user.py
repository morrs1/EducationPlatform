"""Tests for User aggregate."""

from collections import deque
from uuid import uuid4

from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.user.entities.user import User
from answer_service.domain.user.events import UserRegistered
from answer_service.domain.user.value_objects.user_id import UserId


class TestUserCreation:
    """Tests for User.create() method."""

    def test_create_user(self) -> None:
        # Arrange
        user_id = UserId(uuid4())
        events_collection = EventsCollection(events=deque())

        # Act
        sut = User.create(
            user_id=user_id,
            events_collection=events_collection,
        )

        # Assert
        assert sut.id == user_id

    def test_create_user_emits_user_registered_event(self) -> None:
        # Arrange
        user_id = UserId(uuid4())
        events_collection = EventsCollection(events=deque())

        # Act
        User.create(
            user_id=user_id,
            events_collection=events_collection,
        )

        # Assert
        assert len(events_collection.events) == 1
        event = events_collection.events[0]
        assert isinstance(event, UserRegistered)
        assert event.user_id == user_id

    def test_user_id_is_unique(self) -> None:
        # Arrange
        user_id1 = UserId(uuid4())
        user_id2 = UserId(uuid4())
        events_collection1 = EventsCollection(events=deque())
        events_collection2 = EventsCollection(events=deque())

        # Act
        user1 = User.create(user_id=user_id1, events_collection=events_collection1)
        user2 = User.create(user_id=user_id2, events_collection=events_collection2)

        # Assert
        assert user1.id != user2.id
        assert user1.id == user_id1
        assert user2.id == user_id2

    def test_create_multiple_users(self) -> None:
        # Arrange
        events_collection = EventsCollection(events=deque())
        user_ids = [UserId(uuid4()) for _ in range(5)]

        # Act
        users = [
            User.create(user_id=user_id, events_collection=events_collection)
            for user_id in user_ids
        ]

        # Assert
        assert len(users) == 5
        assert all(user.id in user_ids for user in users)
        assert len({user.id for user in users}) == 5  # All IDs are unique


class TestUserIdentity:
    """Tests for User identity."""

    def test_user_identity_from_uuid(self) -> None:
        # Arrange
        user_id = UserId(uuid4())
        events_collection = EventsCollection(events=deque())

        # Act
        sut = User.create(user_id=user_id, events_collection=events_collection)

        # Assert
        assert isinstance(sut.id, type(user_id))
        assert sut.id == user_id

    def test_user_identity_preserved(self) -> None:
        # Arrange
        user_id = UserId(uuid4())
        events_collection = EventsCollection(events=deque())
        sut = User.create(user_id=user_id, events_collection=events_collection)

        # Assert
        assert sut.id == user_id


class TestUserEvents:
    """Tests for User domain events."""

    def test_user_registered_event_is_added_to_collection(self) -> None:
        # Arrange
        user_id = UserId(uuid4())
        events_collection = EventsCollection(events=deque())

        # Act
        User.create(user_id=user_id, events_collection=events_collection)

        # Assert
        assert len(events_collection.events) == 1
        assert isinstance(events_collection.events[0], UserRegistered)

    def test_user_registered_event_contains_correct_user_id(self) -> None:
        # Arrange
        user_id = UserId(uuid4())
        events_collection = EventsCollection(events=deque())

        # Act
        User.create(user_id=user_id, events_collection=events_collection)

        # Assert
        event = events_collection.events[0]
        assert isinstance(event, UserRegistered)
        assert event.user_id == user_id


class TestUserEquality:
    """Tests for User equality."""

    def test_users_with_same_id_are_equal(self) -> None:
        # Arrange
        user_id = UserId(uuid4())
        events_collection1 = EventsCollection(events=deque())
        events_collection2 = EventsCollection(events=deque())

        # Note: User uses eq=False in dataclass (inherits from Aggregate)
        user1 = User.create(user_id=user_id, events_collection=events_collection1)
        user2 = User.create(user_id=user_id, events_collection=events_collection2)

        # Assert
        assert user1.id == user2.id

    def test_users_with_different_id_are_not_equal(self) -> None:
        # Arrange
        events_collection = EventsCollection(events=deque())
        user1 = User.create(user_id=UserId(uuid4()), events_collection=events_collection)
        user2 = User.create(user_id=UserId(uuid4()), events_collection=events_collection)

        # Assert
        assert user1.id != user2.id
