from typing import Annotated, Final
from uuid import UUID

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Body, Path, status

from answer_service.application.commands.lesson_index.index_lesson import (
    IndexLessonCommand,
    IndexLessonCommandHandler,
)
from answer_service.presentation.http.v1.common.exception_handler import ExceptionSchema
from answer_service.presentation.http.v1.routes.lesson_index.index_lesson.schemas import (
    IndexLessonRequest,
)

index_lesson_router: Final[APIRouter] = APIRouter(
    tags=["Lesson Index"],
    route_class=DishkaRoute,
)

LessonIdPath = Path(
    title="Lesson ID",
    description="UUID of the lesson to index (external ID from the lesson service)",
    examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
)


@index_lesson_router.post(
    "/{lesson_id}/index",
    status_code=status.HTTP_201_CREATED,
    summary="Index lesson content for RAG search",
    responses={
        status.HTTP_409_CONFLICT: {"model": ExceptionSchema},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ExceptionSchema},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ExceptionSchema},
    },
)
async def index_lesson_handler(
    lesson_id: Annotated[UUID, LessonIdPath],
    body: Annotated[IndexLessonRequest, Body()],
    interactor: FromDishka[IndexLessonCommandHandler],
) -> None:
    await interactor(
        IndexLessonCommand(
            lesson_id=lesson_id,
            title=body.title,
            content=body.content,
        )
    )
