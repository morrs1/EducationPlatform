from typing import Annotated, Final
from uuid import UUID

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Path, status

from answer_service.application.commands.conversation.close_conversation import (
    CloseConversationCommand,
    CloseConversationCommandHandler,
)
from answer_service.presentation.http.v1.common.exception_handler import ExceptionSchema

close_conversation_router: Final[APIRouter] = APIRouter(
    tags=["Conversation"],
    route_class=DishkaRoute,
)

ConversationIdPath = Path(
    title="Conversation ID",
    description="UUID of the conversation to close",
    examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
)


@close_conversation_router.patch(
    "/{conversation_id}/close",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Close an active conversation",
    responses={
        status.HTTP_404_NOT_FOUND: {"model": ExceptionSchema},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ExceptionSchema},
    },
)
async def close_conversation_handler(
    conversation_id: Annotated[UUID, ConversationIdPath],
    interactor: FromDishka[CloseConversationCommandHandler],
) -> None:
    await interactor(CloseConversationCommand(conversation_id=conversation_id))
