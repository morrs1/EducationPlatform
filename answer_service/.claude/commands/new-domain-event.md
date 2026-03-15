Scaffold a new domain event for the answer-service project.

The user will specify: domain name and event name (e.g. "conversation / ConversationClosed").

## 1. Add the event to `src/answer_service/domain/{domain}/events.py`

```python
@dataclass(frozen=True, kw_only=True)
class {EventName}(Event):
    """Raised when {describe what happened}."""

    # domain value object fields (not primitives)
    {field}: {ValueObjectType}
```

Rules for event fields:
- Use domain value objects, not raw primitives
- `event_id` and `event_date` are inherited from `Event` — do NOT redeclare them
- Keep events immutable (`frozen=True`)

## 2. Register the event in the aggregate

In `src/answer_service/domain/{domain}/entities/{aggregate}.py`, add the event to the relevant method:

```python
self._events_collection.record(
    {EventName}(
        {field}=self.{field},
    )
)
```

## 3. Register a Bazario handler (if in-process handling needed)

Create `src/answer_service/application/event_handlers/{domain}/{snake_case_name}.py`:

```python
from bazario.asyncio import NotificationHandler
from typing import Final, final

from answer_service.domain.{domain}.events import {EventName}


@final
class {EventName}Handler(NotificationHandler[{EventName}]):
    def __init__(self, ...) -> None:
        ...

    async def handle(self, event: {EventName}) -> None:
        ...
```

Then register in `ioc.py` `bazario_provider()`:
```python
registry.register({EventName}, {EventName}Handler)
```

## 4. After changes

Run `/check` to verify code quality and update unit tests for the aggregate.
