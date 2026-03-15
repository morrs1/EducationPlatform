from typing import Annotated, Final
from uuid import UUID

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Path, status

from answer_service.application.queries.lesson_index.get_lesson_index_status import (
    GetLessonIndexStatusQuery,
    GetLessonIndexStatusQueryHandler,
)
from answer_service.presentation.http.v1.common.exception_handler import ExceptionSchema

from .schemas import LessonIndexStatusResponse

get_lesson_index_status_router: Final[APIRouter] = APIRouter(
    tags=["Lesson Index"],
    route_class=DishkaRoute,
)

LessonIdPath = Path(
    title="Lesson ID",
    description="UUID of the lesson (external ID from the lesson service)",
    examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
)


@get_lesson_index_status_router.get(
    "/{lesson_id}/index",
    status_code=status.HTTP_200_OK,
    summary="Get the indexing status and metadata for a lesson",
    responses={
        status.HTTP_404_NOT_FOUND: {"model": ExceptionSchema},
    },
)
async def get_lesson_index_status_handler(
    lesson_id: Annotated[UUID, LessonIdPath],
    interactor: FromDishka[GetLessonIndexStatusQueryHandler],
) -> LessonIndexStatusResponse:
    view = await interactor(GetLessonIndexStatusQuery(lesson_id=lesson_id))
    return LessonIndexStatusResponse(
        lesson_id=view.lesson_id,
        title=view.title,
        status=view.status,
        chunks_count=view.chunks_count,
        indexed_at=view.indexed_at,
    )
