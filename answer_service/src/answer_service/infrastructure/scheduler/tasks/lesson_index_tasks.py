import logging
from typing import Final

from dishka import FromDishka
from dishka.integrations.taskiq import inject
from taskiq import AsyncBroker

from answer_service.application.commands.lesson_index.index_lesson import (
    IndexLessonCommand,
    IndexLessonCommandHandler,
)
from answer_service.application.commands.lesson_index.reindex_lesson import (
    ReindexLessonCommand,
    ReindexLessonCommandHandler,
)
from answer_service.application.common.ports.scheduler.payloads import (
    IndexLessonPayload,
    ReindexLessonPayload,
)

logger: Final[logging.Logger] = logging.getLogger(__name__)


@inject(patch_module=True)
async def index_lesson_task(
    payload: IndexLessonPayload,
    handler: FromDishka[IndexLessonCommandHandler],
) -> None:
    """Background task: index lesson content into the vector store."""
    logger.info("index_lesson_task: started. lesson_id='%s'.", payload.lesson_id)
    await handler(
        IndexLessonCommand(
            lesson_id=payload.lesson_id,
            title=payload.title,
            content=payload.content,
        )
    )
    logger.info("index_lesson_task: done. lesson_id='%s'.", payload.lesson_id)


@inject(patch_module=True)
async def reindex_lesson_task(
    payload: ReindexLessonPayload,
    handler: FromDishka[ReindexLessonCommandHandler],
) -> None:
    """Background task: re-index updated lesson content."""
    logger.info("reindex_lesson_task: started. lesson_id='%s'.", payload.lesson_id)
    await handler(
        ReindexLessonCommand(
            lesson_id=payload.lesson_id,
            new_content=payload.new_content,
            new_title=payload.new_title,
        )
    )
    logger.info("reindex_lesson_task: done. lesson_id='%s'.", payload.lesson_id)


def setup_lesson_index_tasks(broker: AsyncBroker) -> None:
    broker.register_task(
        func=index_lesson_task,
        task_name="index_lesson",
        retry_on_error=True,
        max_retries=3,
        delay=30,
    )
    broker.register_task(
        func=reindex_lesson_task,
        task_name="reindex_lesson",
        retry_on_error=True,
        max_retries=3,
        delay=30,
    )
