from typing import Final, Iterable

from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter

from answer_service.presentation.http.v1.routes.user.create_user.handlers import create_user_router
from answer_service.presentation.http.v1.routes.user.delete_user.handlers import delete_user_router
from answer_service.presentation.http.v1.routes.user.get_user.handlers import get_user_router
from answer_service.presentation.http.v1.routes.user.get_users.handlers import get_users_router

user_router: Final[APIRouter] = APIRouter(
    tags=["User"],
    prefix="/users",
    route_class=DishkaRoute,
)

_sub_routers: Final[Iterable[APIRouter]] = (
    create_user_router,
    get_users_router,
    get_user_router,
    delete_user_router,
)

for _sub_router in _sub_routers:
    user_router.include_router(_sub_router)
