import logging
from dataclasses import dataclass
from typing import Final, final

from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.application.common.query_params.pagination import Pagination
from answer_service.application.common.query_params.sorting import SortingOrder
from answer_service.application.common.query_params.user_params import (
    UserListParams,
    UserSortField,
)
from answer_service.application.common.views.user_views import UserView

logger: Final[logging.Logger] = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class GetUsersQuery:
    limit: int | None = None
    offset: int | None = None
    sorting_field: UserSortField = UserSortField.created_at
    sorting_order: SortingOrder = SortingOrder.DESC


@final
class GetUsersQueryHandler:
    def __init__(self, user_repository: UserRepository) -> None:
        self._user_repository: Final[UserRepository] = user_repository

    async def __call__(self, data: GetUsersQuery) -> list[UserView]:
        logger.info("get_users: started.")

        params = UserListParams(
            pagination=Pagination(limit=data.limit, offset=data.offset),
            sorting_field=data.sorting_field,
            sorting_order=data.sorting_order,
        )

        users = await self._user_repository.get_all(params)

        return [
            UserView(
                user_id=user.id,
                created_at=user.created_at,
                updated_at=user.updated_at,
            )
            for user in users
        ]
