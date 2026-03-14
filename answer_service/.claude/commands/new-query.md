Scaffold a new application query + handler for the answer-service project.

The user will specify: domain name and query purpose (e.g. "conversation / get by id").

**File:** `src/answer_service/application/queries/{domain}/{snake_case_name}.py`

```python
import structlog
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

logger: Final[structlog.BoundLogger] = structlog.get_logger()


@dataclass(frozen=True, slots=True, kw_only=True)
class {Name}Query:
    # primitive fields only
    ...


@dataclass(frozen=True, slots=True, kw_only=True)
class {Name}View:
    # what the handler returns (primitives only)
    ...


@final
class {Name}QueryHandler:
    def __init__(
        self,
        # query gateway / read model port
        ...
    ) -> None:
        ...

    async def __call__(self, data: {Name}Query) -> {Name}View:
        logger.info("{name}: started", ...)
        # query the read model / repository
        # NO writes, NO events, NO transaction commit
        ...
        return {Name}View(...)
```

Rules:
- Queries are read-only — no side effects, no transaction commit, no event publishing
- Use dedicated read-model / query gateway ports, not the same repo as commands
- Views return primitive types only
- After creating the file, run `/check` to verify code quality
