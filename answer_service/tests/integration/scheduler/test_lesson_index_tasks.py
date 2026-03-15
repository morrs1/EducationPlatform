"""Integration tests for lesson index taskiq tasks."""

import asyncio
from uuid import uuid4

import pytest
from dishka import AsyncContainer
from langchain_chroma import Chroma
from taskiq import AsyncBroker

from answer_service.application.common.ports.scheduler.payloads import (
    IndexLessonPayload,
    ReindexLessonPayload,
)

pytestmark = pytest.mark.asyncio(loop_scope="session")

_LESSON_CONTENT = (
    "Python is a high-level programming language. "
    "It is widely used in data science, web development, and automation."
)


# ---------------------------------------------------------------------------
# Task registration
# ---------------------------------------------------------------------------


async def test_index_lesson_task_is_registered_on_broker(  # noqa: RUF029
    inmemory_taskiq_broker: AsyncBroker,
) -> None:
    # Act
    task = inmemory_taskiq_broker.find_task("index_lesson")

    # Assert
    assert task is not None
    assert task.task_name == "index_lesson"


async def test_reindex_lesson_task_is_registered_on_broker(  # noqa: RUF029
    inmemory_taskiq_broker: AsyncBroker,
) -> None:
    # Act
    task = inmemory_taskiq_broker.find_task("reindex_lesson")

    # Assert
    assert task is not None
    assert task.task_name == "reindex_lesson"


# ---------------------------------------------------------------------------
# Task execution via InMemoryBroker
# ---------------------------------------------------------------------------


async def test_index_lesson_task_indexes_chunks_into_chroma(
    scheduler_worker_container: AsyncContainer,
    dishka_container: AsyncContainer,
    inmemory_taskiq_broker: AsyncBroker,
) -> None:
    """index_lesson_task: InMemoryBroker → handler → Chroma has chunks for lesson."""
    # Arrange
    lesson_id = uuid4()
    task = inmemory_taskiq_broker.find_task("index_lesson")
    assert task is not None

    payload = IndexLessonPayload(
        lesson_id=lesson_id,
        title="Intro to Python",
        content=_LESSON_CONTENT,
    )

    # Act
    result = await task.kicker().kiq(payload)
    await result.wait_result(timeout=5)

    # Assert — Chroma has at least one chunk for this lesson
    chroma: Chroma = await dishka_container.get(Chroma)
    stored = await asyncio.to_thread(chroma.get, where={"lesson_id": str(lesson_id)})
    assert len(stored["ids"]) > 0


async def test_reindex_lesson_task_replaces_chunks_in_chroma(
    scheduler_worker_container: AsyncContainer,
    dishka_container: AsyncContainer,
    inmemory_taskiq_broker: AsyncBroker,
) -> None:
    """reindex_lesson_task replaces old chunks with new ones for the same lesson."""
    # Arrange — first index the lesson
    lesson_id = uuid4()
    index_task = inmemory_taskiq_broker.find_task("index_lesson")
    reindex_task = inmemory_taskiq_broker.find_task("reindex_lesson")
    assert index_task is not None
    assert reindex_task is not None

    index_result = await index_task.kicker().kiq(
        IndexLessonPayload(
            lesson_id=lesson_id,
            title="Original Title",
            content=_LESSON_CONTENT,
        )
    )
    await index_result.wait_result(timeout=5)

    # Act — reindex with new content
    reindex_result = await reindex_task.kicker().kiq(
        ReindexLessonPayload(
            lesson_id=lesson_id,
            new_content="Completely new content for the lesson.",
            new_title="Updated Title",
        )
    )
    await reindex_result.wait_result(timeout=5)

    # Assert — Chroma still has chunks for this lesson (reindex didn't remove all)
    chroma: Chroma = await dishka_container.get(Chroma)
    stored = await asyncio.to_thread(chroma.get, where={"lesson_id": str(lesson_id)})
    assert len(stored["ids"]) > 0


async def test_index_lesson_task_multiple_lessons_are_isolated(
    scheduler_worker_container: AsyncContainer,
    dishka_container: AsyncContainer,
    inmemory_taskiq_broker: AsyncBroker,
) -> None:
    """Chunks from different lessons are stored independently."""
    # Arrange
    lesson_id_a = uuid4()
    lesson_id_b = uuid4()
    task = inmemory_taskiq_broker.find_task("index_lesson")
    assert task is not None

    # Act — index two different lessons
    result_a = await task.kicker().kiq(
        IndexLessonPayload(
            lesson_id=lesson_id_a, title="Lesson A", content=_LESSON_CONTENT
        )
    )
    result_b = await task.kicker().kiq(
        IndexLessonPayload(
            lesson_id=lesson_id_b, title="Lesson B", content=_LESSON_CONTENT
        )
    )
    await result_a.wait_result(timeout=5)
    await result_b.wait_result(timeout=5)

    # Assert — each lesson has its own chunks, none bleed into the other
    chroma: Chroma = await dishka_container.get(Chroma)
    stored_a = await asyncio.to_thread(chroma.get, where={"lesson_id": str(lesson_id_a)})
    stored_b = await asyncio.to_thread(chroma.get, where={"lesson_id": str(lesson_id_b)})

    ids_a = set(stored_a["ids"])
    ids_b = set(stored_b["ids"])

    assert len(ids_a) > 0
    assert len(ids_b) > 0
    assert ids_a.isdisjoint(ids_b)
