import logging
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

from answer_service.application.common.ports.conversation_repository import ConversationRepository
from answer_service.application.common.views.conversation_views import ConversationView, MessageView
from answer_service.application.errors import ConversationNotFoundError

logger: Final[logging.Logger] = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class GetConversationQuery:
    conversation_id: UUID


@final
class GetConversationQueryHandler:
    def __init__(self, conversation_repository: ConversationRepository) -> None:
        self._conversation_repository: Final[ConversationRepository] = conversation_repository

    async def __call__(self, data: GetConversationQuery) -> ConversationView:
        logger.info("get_conversation: started. conversation_id='%s'.", data.conversation_id)

        conversation = await self._conversation_repository.get_by_id(data.conversation_id)
        if conversation is None:
            msg = f"Conversation '{data.conversation_id}' not found."
            raise ConversationNotFoundError(msg)

        messages = [
            MessageView(
                message_id=message.id,
                question=str(message.question),
                answer=str(message.answer) if message.answer is not None else None,
                status=str(message.status),
                created_at=message.created_at,
            )
            for message in conversation.messages
        ]

        return ConversationView(
            conversation_id=conversation.id,
            user_id=conversation.user_id,
            lesson_id=conversation.lesson_id,
            status=str(conversation.status),
            messages=messages,
            created_at=conversation.created_at,
        )
