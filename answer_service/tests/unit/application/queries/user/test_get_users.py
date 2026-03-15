from unittest.mock import AsyncMock

import pytest

from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.application.common.views.user_views import UserView
from answer_service.application.queries.user.get_users import (
    GetUsersQuery,
    GetUsersQueryHandler,
)
from tests.unit.factories.entities import make_user


@pytest.fixture()
def handler(user_repository: UserRepository) -> GetUsersQueryHandler:
    return GetUsersQueryHandler(user_repository=user_repository)


async def test_get_users_returns_list_of_views(
    handler: GetUsersQueryHandler,
    user_repository: UserRepository,
) -> None:
    # Arrange
    users = [make_user(), make_user()]
    user_repository.get_all = AsyncMock(return_value=users)

    # Act
    result = await handler(GetUsersQuery())

    # Assert
    assert len(result) == 2
    assert all(isinstance(v, UserView) for v in result)


async def test_get_users_returns_empty_list_when_none(
    handler: GetUsersQueryHandler,
    user_repository: UserRepository,
) -> None:
    # Arrange
    user_repository.get_all = AsyncMock(return_value=[])

    # Act
    result = await handler(GetUsersQuery())

    # Assert
    assert result == []
