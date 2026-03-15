import logging
from typing import Final

from dishka import FromDishka
from dishka_faststream import inject
from faststream.middlewares import AckPolicy
from faststream.rabbit import RabbitMessage, RabbitRouter

from answer_service.application.commands.user.create_user import (
    CreateUserCommand,
    CreateUserCommandHandler,
)
from answer_service.application.commands.user.delete_user import (
    DeleteUserCommand,
    DeleteUserCommandHandler,
)
from answer_service.domain.common.errors import AppError
from answer_service.presentation.rabbitmq.v1.user.schemas import (
    UserDeletedMessage,
    UserRegisteredMessage,
)

logger: Final[logging.Logger] = logging.getLogger(__name__)

user_rabbit_router: Final[RabbitRouter] = RabbitRouter()


@user_rabbit_router.subscriber(
    "user.registered",
    ack_policy=AckPolicy.MANUAL,
    title="User Registered",
    description="Register a user projection on auth service user creation.",
)
@inject
async def on_user_registered(
    message: UserRegisteredMessage,
    msg: RabbitMessage,
    interactor: FromDishka[CreateUserCommandHandler],
) -> None:
    logger.info("user.registered received: user_id=%s", message.user_id)
    try:
        await interactor(CreateUserCommand(user_id=message.user_id))
        await msg.ack()
        logger.info("user.registered processed: user_id=%s", message.user_id)
    except AppError:
        logger.exception("user.registered failed: user_id=%s", message.user_id)
        await msg.nack()


@user_rabbit_router.subscriber(
    "user.deleted",
    ack_policy=AckPolicy.MANUAL,
    title="User Deleted",
    description="Remove a user projection when a user is deleted in the auth service.",
)
@inject
async def on_user_deleted(
    message: UserDeletedMessage,
    msg: RabbitMessage,
    interactor: FromDishka[DeleteUserCommandHandler],
) -> None:
    logger.info("user.deleted received: user_id=%s", message.user_id)
    try:
        await interactor(DeleteUserCommand(user_id=message.user_id))
        await msg.ack()
        logger.info("user.deleted processed: user_id=%s", message.user_id)
    except AppError:
        logger.exception("user.deleted failed: user_id=%s", message.user_id)
        await msg.nack()
