import logging
from typing import Final

from dishka import FromDishka
from dishka_faststream import inject
from faststream.middlewares import AckPolicy
from faststream.rabbit import RabbitMessage, RabbitRouter

from answer_service.application.commands.lesson_index.schedule_index_lesson import (
    ScheduleIndexLessonCommand,
    ScheduleIndexLessonCommandHandler,
)
from answer_service.application.commands.lesson_index.schedule_reindex_lesson import (
    ScheduleReindexLessonCommand,
    ScheduleReindexLessonCommandHandler,
)
from answer_service.domain.common.errors import AppError
from answer_service.presentation.rabbitmq.v1.lesson_index.schemas import (
    LessonCreatedMessage,
    LessonUpdatedMessage,
)

logger: Final[logging.Logger] = logging.getLogger(__name__)

lesson_index_rabbit_router: Final[RabbitRouter] = RabbitRouter()


@lesson_index_rabbit_router.subscriber(
    "lesson.created",
    ack_policy=AckPolicy.MANUAL,
    title="Lesson Created",
    description="Schedule RAG indexing for a newly created lesson.",
)
@inject
async def on_lesson_created(
    message: LessonCreatedMessage,
    msg: RabbitMessage,
    interactor: FromDishka[ScheduleIndexLessonCommandHandler],
) -> None:
    logger.info("lesson.created received: lesson_id=%s", message.lesson_id)
    try:
        await interactor(
            ScheduleIndexLessonCommand(
                lesson_id=message.lesson_id,
                title=message.title,
                content=message.content,
            )
        )
        await msg.ack()
        logger.info("lesson.created processed: lesson_id=%s", message.lesson_id)
    except AppError:
        logger.exception("lesson.created failed: lesson_id=%s", message.lesson_id)
        await msg.nack()


@lesson_index_rabbit_router.subscriber(
    "lesson.updated",
    ack_policy=AckPolicy.MANUAL,
    title="Lesson Updated",
    description="Schedule RAG reindexing for an updated lesson.",
)
@inject
async def on_lesson_updated(
    message: LessonUpdatedMessage,
    msg: RabbitMessage,
    interactor: FromDishka[ScheduleReindexLessonCommandHandler],
) -> None:
    logger.info("lesson.updated received: lesson_id=%s", message.lesson_id)
    try:
        await interactor(
            ScheduleReindexLessonCommand(
                lesson_id=message.lesson_id,
                new_title=message.new_title,
                new_content=message.new_content,
            )
        )
        await msg.ack()
        logger.info("lesson.updated processed: lesson_id=%s", message.lesson_id)
    except AppError:
        logger.exception("lesson.updated failed: lesson_id=%s", message.lesson_id)
        await msg.nack()
