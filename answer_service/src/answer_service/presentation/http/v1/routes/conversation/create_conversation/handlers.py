from typing import Annotated, Final

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Body, status

from answer_service.application.commands.conversation.create_conversation import (
    CreateConversationCommand,
    CreateConversationCommandHandler,
)
from answer_service.presentation.http.v1.common.exception_handler import ExceptionSchema

from .schemas import CreateConversationRequest, CreateConversationResponse

create_conversation_router: Final[APIRouter] = APIRouter(
    tags=["Conversation"],
    route_class=DishkaRoute,
)


@create_conversation_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new conversation for a user and lesson",
    responses={
        status.HTTP_400_BAD_REQUEST: {"model": ExceptionSchema},
    },
)
async def create_conversation_handler(
    body: Annotated[CreateConversationRequest, Body()],
    interactor: FromDishka[CreateConversationCommandHandler],
) -> CreateConversationResponse:
    view = await interactor(
        CreateConversationCommand(
            user_id=body.user_id,
            lesson_id=body.lesson_id,
        )
    )
    return CreateConversationResponse(conversation_id=view.conversation_id)
