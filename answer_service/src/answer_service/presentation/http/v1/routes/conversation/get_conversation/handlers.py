from typing import Annotated, Final
from uuid import UUID

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Path, status

from answer_service.application.queries.conversation.get_conversation import (
    GetConversationQuery,
    GetConversationQueryHandler,
)
from answer_service.presentation.http.v1.common.exception_handler import ExceptionSchema

from .schemas import ConversationResponse, MessageResponse

get_conversation_router: Final[APIRouter] = APIRouter(
    tags=["Conversation"],
    route_class=DishkaRoute,
)

ConversationIdPath = Path(
    title="Conversation ID",
    description="UUID of the conversation to retrieve",
    examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
)


@get_conversation_router.get(
    "/{conversation_id}",
    status_code=status.HTTP_200_OK,
    summary="Get a conversation with all its messages",
    responses={
        status.HTTP_404_NOT_FOUND: {"model": ExceptionSchema},
    },
)
async def get_conversation_handler(
    conversation_id: Annotated[UUID, ConversationIdPath],
    interactor: FromDishka[GetConversationQueryHandler],
) -> ConversationResponse:
    view = await interactor(GetConversationQuery(conversation_id=conversation_id))
    return ConversationResponse(
        conversation_id=view.conversation_id,
        user_id=view.user_id,
        lesson_id=view.lesson_id,
        status=view.status,
        messages=[
            MessageResponse(
                message_id=msg.message_id,
                question=msg.question,
                answer=msg.answer,
                status=msg.status,
                created_at=msg.created_at,
            )
            for msg in view.messages
        ],
        created_at=view.created_at,
    )
