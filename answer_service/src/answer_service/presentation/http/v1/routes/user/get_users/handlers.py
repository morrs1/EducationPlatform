from typing import Annotated, Final

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Query, status

from answer_service.application.common.query_params.sorting import SortingOrder
from answer_service.application.common.query_params.user_params import UserSortField
from answer_service.application.queries.user.get_users import (
    GetUsersQuery,
    GetUsersQueryHandler,
)
from answer_service.presentation.http.v1.common.exception_handler import ExceptionSchema
from answer_service.presentation.http.v1.routes.user.get_users.schemas import (
    UserListItemResponse,
)

get_users_router: Final[APIRouter] = APIRouter(
    tags=["User"],
    route_class=DishkaRoute,
)


@get_users_router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="List users with optional pagination and sorting",
    responses={
        status.HTTP_400_BAD_REQUEST: {"model": ExceptionSchema},
    },
)
async def get_users_handler(
    interactor: FromDishka[GetUsersQueryHandler],
    limit: Annotated[int | None, Query(ge=1, le=200)] = None,
    offset: Annotated[int | None, Query(ge=0)] = None,
    sorting_field: Annotated[UserSortField, Query()] = UserSortField.created_at,
    sorting_order: Annotated[SortingOrder, Query()] = SortingOrder.DESC,
) -> list[UserListItemResponse]:
    views = await interactor(
        GetUsersQuery(
            limit=limit,
            offset=offset,
            sorting_field=sorting_field,
            sorting_order=sorting_order,
        )
    )
    return [
        UserListItemResponse(
            user_id=v.user_id,
            created_at=v.created_at,
            updated_at=v.updated_at,
        )
        for v in views
    ]
