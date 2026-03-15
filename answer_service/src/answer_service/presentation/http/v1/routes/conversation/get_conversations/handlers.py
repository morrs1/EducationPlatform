from typing import Annotated, Final
from uuid import UUID

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Query, status

from answer_service.application.common.query_params.conversation_params import (
    ConversationSortField,
)
from answer_service.application.common.query_params.sorting import SortingOrder
from answer_service.application.queries.conversation.get_conversations import (
    GetConversationsQuery,
    GetConversationsQueryHandler,
)
from answer_service.presentation.http.v1.common.exception_handler import ExceptionSchema

from .schemas import ConversationListItemResponse

get_conversations_router: Final[APIRouter] = APIRouter(
    tags=["Conversation"],
    route_class=DishkaRoute,
)


@get_conversations_router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="List conversations for a user with optional pagination and sorting",
    responses={
        status.HTTP_400_BAD_REQUEST: {"model": ExceptionSchema},
    },
)
async def get_conversations_handler(
    interactor: FromDishka[GetConversationsQueryHandler],
    user_id: Annotated[UUID, Query(description="Filter conversations by user ID")],
    limit: Annotated[int | None, Query(ge=1, le=200)] = None,
    offset: Annotated[int | None, Query(ge=0)] = None,
    sorting_field: Annotated[
        ConversationSortField, Query()
    ] = ConversationSortField.created_at,
    sorting_order: Annotated[SortingOrder, Query()] = SortingOrder.DESC,
) -> list[ConversationListItemResponse]:
    views = await interactor(
        GetConversationsQuery(
            user_id=user_id,
            limit=limit,
            offset=offset,
            sorting_field=sorting_field,
            sorting_order=sorting_order,
        )
    )
    return [
        ConversationListItemResponse(
            conversation_id=v.conversation_id,
            user_id=v.user_id,
            lesson_id=v.lesson_id,
            status=v.status,
            messages_count=v.messages_count,
            created_at=v.created_at,
        )
        for v in views
    ]
