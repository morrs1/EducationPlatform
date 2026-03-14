from typing import Annotated, Final

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Body, status

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


@ask_question_router.post(
    "/ask",
    status_code=status.HTTP_201_CREATED,
    summary="Ask a question within a lesson context (creates or continues a conversation)",
    responses={
        status.HTTP_404_NOT_FOUND: {"model": ExceptionSchema},
        status.HTTP_422_UNPROCESSABLE_ENTITY: {"model": ExceptionSchema},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ExceptionSchema},
    },
)
async def ask_question_handler(
    body: Annotated[AskQuestionRequest, Body()],
    interactor: FromDishka[AskQuestionCommandHandler],
) -> AnswerResponse:
    view = await interactor(
        AskQuestionCommand(
            user_id=body.user_id,
            lesson_id=body.lesson_id,
            question=body.question,
            conversation_id=body.conversation_id,
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
