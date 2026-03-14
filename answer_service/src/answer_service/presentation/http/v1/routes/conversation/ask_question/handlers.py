from typing import Annotated, Final
from uuid import UUID

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Body, Path, status

from answer_service.application.commands.conversation.ask_question import AskQuestionCommand, AskQuestionCommandHandler
from answer_service.presentation.http.v1.common.exception_handler import ExceptionSchema
from answer_service.presentation.http.v1.routes.conversation.ask_question.schemas import (
    AnswerResponse,
    AskQuestionRequest,
)

ask_question_router: Final[APIRouter] = APIRouter(
    tags=["Conversation"],
    route_class=DishkaRoute,
)

ConversationIdPath = Path(
    title="Conversation ID",
    description="UUID of the conversation to send a question to",
    examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
)


@ask_question_router.post(
    "/{conversation_id}/ask",
    status_code=status.HTTP_201_CREATED,
    summary="Ask a question within an existing conversation",
    responses={
        status.HTTP_404_NOT_FOUND: {"model": ExceptionSchema},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ExceptionSchema},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ExceptionSchema},
    },
)
async def ask_question_handler(
    conversation_id: Annotated[UUID, ConversationIdPath],
    body: Annotated[AskQuestionRequest, Body()],
    interactor: FromDishka[AskQuestionCommandHandler],
) -> AnswerResponse:
    view = await interactor(
        AskQuestionCommand(
            conversation_id=conversation_id,
            question=body.question,
        )
    )
    return AnswerResponse(
        conversation_id=view.conversation_id,
        message_id=view.message_id,
        answer_content=view.answer_content,
        model_name=view.model_name,
        input_tokens=view.input_tokens,
        output_tokens=view.output_tokens,
    )
