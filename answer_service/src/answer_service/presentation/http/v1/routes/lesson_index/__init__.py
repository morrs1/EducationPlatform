from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter
from typing import Final, Iterable
from answer_service.presentation.http.v1.routes.lesson_index.index_lesson.handlers import index_lesson_router
from answer_service.presentation.http.v1.routes.lesson_index.get_lesson_index_status.handlers import get_lesson_index_status_router
from answer_service.presentation.http.v1.routes.lesson_index.reindex_lesson.handlers import reindex_lesson_router

lesson_router: Final[APIRouter] = APIRouter(
    tags=["Lesson Index"],
    prefix="/lesson",
    route_class=DishkaRoute,
)

sub_lesson_routers: Final[Iterable[APIRouter]] = (
    index_lesson_router,
    get_lesson_index_status_router,
    reindex_lesson_router
)

for sub_router in sub_lesson_routers:
    lesson_router.include_router(sub_router)
