from collections.abc import Iterable
from typing import Final

from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter

from .get_lesson_index_status.handlers import get_lesson_index_status_router
from .index_lesson.handlers import index_lesson_router
from .reindex_lesson.handlers import reindex_lesson_router

lesson_router: Final[APIRouter] = APIRouter(
    tags=["Lesson Index"],
    prefix="/lesson",
    route_class=DishkaRoute,
)

_sub_routers: Final[Iterable[APIRouter]] = (
    index_lesson_router,
    get_lesson_index_status_router,
    reindex_lesson_router,
)

for _sub_router in _sub_routers:
    lesson_router.include_router(_sub_router)
