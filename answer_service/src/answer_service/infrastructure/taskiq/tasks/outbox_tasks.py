import logging
from typing import Final

from dishka import FromDishka
from dishka.integrations.taskiq import inject
from taskiq import async_shared_broker, AsyncBroker

from answer_service.application.commands.outbox.relay_outbox import RelayOutboxCommand, RelayOutboxCommandHandler

logger: Final[logging.Logger] = logging.getLogger(__name__)


@inject
async def relay_outbox_task(
        handler: FromDishka[RelayOutboxCommandHandler],
) -> None:
    """Taskiq task: relay pending outbox messages to RabbitMQ (runs every minute)."""
    await handler(RelayOutboxCommand())


def setup_outbox_tasks(broker: AsyncBroker) -> None:
    broker.register_task(
        func=relay_outbox_task,
        task_name="relay_outbox",
        schedule=[{"cron": "* * * * *"}],
        retry_on_error=True,
        max_retries=3,
        delay=15,
    )
