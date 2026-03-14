import logging
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

from answer_service.application.common.ports.conversation_repository import ConversationRepository
from answer_service.application.common.query_params.conversation_params import (
    ConversationListParams,
    ConversationSortField,
)
from answer_service.application.common.query_params.pagination import Pagination
from answer_service.application.common.query_params.sorting import SortingOrder
from answer_service.application.common.views.conversation_views import ConversationListItemView

logger: Final[logging.Logger] = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class GetConversationsQuery:
    user_id: UUID
    limit: int | None = None
    offset: int | None = None
    sorting_field: ConversationSortField = ConversationSortField.created_at
    sorting_order: SortingOrder = SortingOrder.DESC


@final
class GetConversationsQueryHandler:
    def __init__(self, conversation_repository: ConversationRepository) -> None:
        self._conversation_repository: Final[ConversationRepository] = conversation_repository

    async def __call__(self, data: GetConversationsQuery) -> list[ConversationListItemView]:
        logger.info("get_conversations: started. user_id='%s'.", data.user_id)

        params = ConversationListParams(
            pagination=Pagination(limit=data.limit, offset=data.offset),
            sorting_field=data.sorting_field,
            sorting_order=data.sorting_order,
        )

        conversations = await self._conversation_repository.get_all_by_user(
            user_id=data.user_id,
            params=params,
        )

        return [
            ConversationListItemView(
                conversation_id=conversation.id,
                user_id=conversation.user_id,
                lesson_id=conversation.lesson_id,
                status=str(conversation.status),
                messages_count=len(conversation.messages),
                created_at=conversation.created_at,
            )
            for conversation in conversations
        ]
