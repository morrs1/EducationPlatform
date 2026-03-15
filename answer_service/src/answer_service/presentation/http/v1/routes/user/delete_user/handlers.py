from typing import Annotated, Final
from uuid import UUID

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Path, status

from answer_service.application.commands.user.delete_user import (
    DeleteUserCommand,
    DeleteUserCommandHandler,
)
from answer_service.presentation.http.v1.common.exception_handler import ExceptionSchema

delete_user_router: Final[APIRouter] = APIRouter(
    tags=["User"],
    route_class=DishkaRoute,
)

UserIdPath = Path(
    title="User ID",
    description="UUID of the user to delete",
    examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
)


@delete_user_router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user reference by ID",
    responses={
        status.HTTP_404_NOT_FOUND: {"model": ExceptionSchema},
    },
)
async def delete_user_handler(
    user_id: Annotated[UUID, UserIdPath],
    interactor: FromDishka[DeleteUserCommandHandler],
) -> None:
    await interactor(DeleteUserCommand(user_id=user_id))
