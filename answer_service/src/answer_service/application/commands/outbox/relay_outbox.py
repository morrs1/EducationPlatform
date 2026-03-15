import logging
from dataclasses import dataclass, field
from typing import Final, final

from answer_service.application.common.ports.outbox_publisher import OutboxPublisher
from answer_service.application.common.ports.outbox_repository import OutboxRepository
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.domain.common.errors import AppError

logger: Final[logging.Logger] = logging.getLogger(__name__)

_DEFAULT_BATCH_SIZE: Final[int] = 100


@dataclass(frozen=True, slots=True, kw_only=True)
class RelayOutboxCommand:
    batch_size: int = field(default=_DEFAULT_BATCH_SIZE)


@final
class RelayOutboxCommandHandler:
    """Reads pending outbox messages and publishes them to the message broker.

    Called by the taskiq worker on a schedule (cron every minute).
    Uses ``SELECT … FOR UPDATE SKIP LOCKED`` to allow safe horizontal
    scaling — multiple worker replicas may run concurrently.

    At-least-once delivery guarantee:
    - If ``publish`` succeeds → the row is marked as processed in the same
      transaction so it will not be re-sent.
    - If ``publish`` fails → the row is *not* marked and will be retried
      on the next scheduler tick.
    """

    def __init__(
        self,
        outbox_repository: OutboxRepository,
        outbox_publisher: OutboxPublisher,
        transaction_manager: TransactionManager,
    ) -> None:
        self._outbox_repository: Final[OutboxRepository] = outbox_repository
        self._outbox_publisher: Final[OutboxPublisher] = outbox_publisher
        self._transaction_manager: Final[TransactionManager] = transaction_manager

    async def __call__(self, data: RelayOutboxCommand) -> None:
        logger.info("relay_outbox: started (batch_size=%d)", data.batch_size)

        messages = await self._outbox_repository.get_pending(limit=data.batch_size)
        published = 0

        for message in messages:
            try:
                await self._outbox_publisher.publish(message)
                await self._outbox_repository.mark_processed(message.id)
                published += 1
            except AppError:
                logger.exception(
                    "relay_outbox: failed to publish message id=%s type=%s",
                    message.id,
                    message.event_type,
                )

        if published:
            await self._transaction_manager.commit()

        logger.info(
            "relay_outbox: done. published=%d / total=%d",
            published,
            len(messages),
        )
