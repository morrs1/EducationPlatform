from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.application.common.views.user_views import UserView
from answer_service.application.errors import UserNotFoundError
from answer_service.application.queries.user.get_user_by_id import (
    GetUserByIdQuery,
    GetUserByIdQueryHandler,
)
from tests.unit.factories.entities import make_user


@pytest.fixture()
def handler(user_repository: UserRepository) -> GetUserByIdQueryHandler:
    return GetUserByIdQueryHandler(user_repository=user_repository)


async def test_get_user_by_id_returns_view(
    handler: GetUserByIdQueryHandler,
    user_repository: UserRepository,
) -> None:
    # Arrange
    user = make_user()
    user_repository.get_by_id = AsyncMock(return_value=user)

    # Act
    result = await handler(GetUserByIdQuery(user_id=user.id))

    # Assert
    assert isinstance(result, UserView)
    assert result.user_id == user.id


async def test_get_user_by_id_raises_when_not_found(
    handler: GetUserByIdQueryHandler,
    user_repository: UserRepository,
) -> None:
    # Arrange
    user_repository.get_by_id = AsyncMock(return_value=None)

    # Act / Assert
    with pytest.raises(UserNotFoundError):
        await handler(GetUserByIdQuery(user_id=uuid4()))
