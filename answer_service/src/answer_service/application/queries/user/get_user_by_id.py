import logging
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.application.common.views.user_views import UserView
from answer_service.application.errors import UserNotFoundError

logger: Final[logging.Logger] = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class GetUserByIdQuery:
    user_id: UUID


@final
class GetUserByIdQueryHandler:
    def __init__(self, user_repository: UserRepository) -> None:
        self._user_repository: Final[UserRepository] = user_repository

    async def __call__(self, data: GetUserByIdQuery) -> UserView:
        logger.info("get_user_by_id: started. user_id='%s'.", data.user_id)

        user = await self._user_repository.get_by_id(data.user_id)
        if user is None:
            msg = f"User '{data.user_id}' not found."
            raise UserNotFoundError(msg)

        return UserView(
            user_id=user.id,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
