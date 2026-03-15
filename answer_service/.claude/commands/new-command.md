Scaffold a new application command + handler for the answer-service project.

The user will specify: domain name and command purpose (e.g. "conversation / close").

Follow this structure exactly:

**File:** `src/answer_service/application/commands/{domain}/{snake_case_name}.py`

```python
import logging
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

# ... domain imports ...
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.transaction_manager import TransactionManager

logger: Final[logging.Logger] = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class {Name}Command:
    # primitive fields only — no domain types
    ...


@dataclass(frozen=True, slots=True, kw_only=True)
class {Name}View:
    # what the handler returns
    ...


@final
class {Name}CommandHandler:
    def __init__(
        self,
        transaction_manager: TransactionManager,
        event_bus: EventBus,
        # ... other ports / repositories ...
    ) -> None:
        self._transaction_manager: Final[TransactionManager] = transaction_manager
        self._event_bus: Final[EventBus] = event_bus
        # ...

    async def __call__(self, data: {Name}Command) -> {Name}View:
        logger.info("{name}: started.")

        # 1. Load / create aggregates
        # 2. Call domain methods
        # 3. Save via repository
        # 4. Flush → publish events → commit

        await self._transaction_manager.flush()
        await self._event_bus.publish(...)
        await self._transaction_manager.commit()

        logger.info("{name}: done.")
        return {Name}View(...)
```

Rules:
- Commands use primitive types (UUID, str, int) — convert to domain types inside the handler
- Views return primitive types only
- All dependencies are injected via `__init__`, stored as `Final`
- Use stdlib `logging`, not `structlog`
- After creating the file, run `/check` to verify code quality
