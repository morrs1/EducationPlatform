from typing import Annotated, Final
from uuid import UUID

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Path, status

from answer_service.application.queries.user.get_user_by_id import GetUserByIdQuery, GetUserByIdQueryHandler
from answer_service.presentation.http.v1.common.exception_handler import ExceptionSchema
from answer_service.presentation.http.v1.routes.user.get_user.schemas import UserResponse

get_user_router: Final[APIRouter] = APIRouter(
    tags=["User"],
    route_class=DishkaRoute,
)

UserIdPath = Path(
    title="User ID",
    description="UUID of the user to retrieve",
    examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
)


@get_user_router.get(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Get a user by ID",
    responses={
        status.HTTP_404_NOT_FOUND: {"model": ExceptionSchema},
    },
)
async def get_user_handler(
    user_id: Annotated[UUID, UserIdPath],
    interactor: FromDishka[GetUserByIdQueryHandler],
) -> UserResponse:
    view = await interactor(GetUserByIdQuery(user_id=user_id))
    return UserResponse(
        user_id=view.user_id,
        created_at=view.created_at,
        updated_at=view.updated_at,
    )
