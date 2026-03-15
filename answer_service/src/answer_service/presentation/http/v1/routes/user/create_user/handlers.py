from typing import Annotated, Final

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Body, status

from answer_service.application.commands.user.create_user import (
    CreateUserCommand,
    CreateUserCommandHandler,
)
from answer_service.presentation.http.v1.common.exception_handler import ExceptionSchema
from answer_service.presentation.http.v1.routes.user.create_user.schemas import (
    CreateUserRequest,
)

create_user_router: Final[APIRouter] = APIRouter(
    tags=["User"],
    route_class=DishkaRoute,
)


@create_user_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a user reference from the auth service",
    responses={
        status.HTTP_409_CONFLICT: {"model": ExceptionSchema},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ExceptionSchema},
    },
)
async def create_user_handler(
    body: Annotated[CreateUserRequest, Body()],
    interactor: FromDishka[CreateUserCommandHandler],
) -> None:
    await interactor(CreateUserCommand(user_id=body.user_id))
