from typing import Annotated, Final
from uuid import UUID

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Body, Path, status

from answer_service.application.commands.lesson_index.schedule_reindex_lesson import (
    ScheduleReindexLessonCommand,
    ScheduleReindexLessonCommandHandler,
)
from answer_service.presentation.http.v1.common.exception_handler import ExceptionSchema
from answer_service.presentation.http.v1.routes.lesson_index.reindex_lesson.schemas import (  # noqa: E501
    ReindexLessonRequest,
    ScheduleReindexLessonResponse,
)

reindex_lesson_router: Final[APIRouter] = APIRouter(
    tags=["Lesson Index"],
    route_class=DishkaRoute,
)

LessonIdPath = Path(
    title="Lesson ID",
    description="UUID of the lesson to reindex (external ID from the lesson service)",
    examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
)


@reindex_lesson_router.put(
    "/{lesson_id}/index",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Schedule lesson content reindexing with updated text",
    responses={
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ExceptionSchema},
    },
)
async def reindex_lesson_handler(
    lesson_id: Annotated[UUID, LessonIdPath],
    body: Annotated[ReindexLessonRequest, Body()],
    interactor: FromDishka[ScheduleReindexLessonCommandHandler],
) -> ScheduleReindexLessonResponse:
    view = await interactor(
        ScheduleReindexLessonCommand(
            lesson_id=lesson_id,
            new_content=body.new_content,
            new_title=body.new_title,
        )
    )
    return ScheduleReindexLessonResponse(task_id=view.task_id)
