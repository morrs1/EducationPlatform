from typing import Final, Iterable

from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter

from answer_service.presentation.http.v1.routes.conversation.ask_question.handlers import ask_question_router
from answer_service.presentation.http.v1.routes.conversation.close_conversation.handlers import (
    close_conversation_router,
)
from answer_service.presentation.http.v1.routes.conversation.create_conversation.handlers import (
    create_conversation_router,
)
from answer_service.presentation.http.v1.routes.conversation.get_conversation.handlers import get_conversation_router
from answer_service.presentation.http.v1.routes.conversation.get_conversations.handlers import (
    get_conversations_router,
)

conversation_router: Final[APIRouter] = APIRouter(
    tags=["Conversation"],
    prefix="/conversations",
    route_class=DishkaRoute,
)

_sub_routers: Final[Iterable[APIRouter]] = (
    create_conversation_router,
    ask_question_router,
    get_conversations_router,
    get_conversation_router,
    close_conversation_router,
)

for _sub_router in _sub_routers:
    conversation_router.include_router(_sub_router)
