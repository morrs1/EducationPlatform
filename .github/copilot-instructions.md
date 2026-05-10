# GitHub Copilot — Repository Instructions

These instructions apply to **every** Copilot chat and inline completion in this repository. Scoped instructions live under `.github/instructions/*.instructions.md` and are auto-attached to matching files via their `applyTo` frontmatter.

For agentic edits, also read `AGENTS.md` and `CLAUDE.md` at the root and inside the service you are editing. The four files (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.github/copilot-instructions.md`) encode the same intent for different tools — if you change one, change the others too.

## Project Overview

Polyglot microservice monorepo for an education platform.

- `api_gateway/` — Spring Boot 4 (Java 25) reverse proxy, auth, authorization. Port `8090`.
- `user_service/` — Spring Boot 4 user identity. Port `8080`.
- `course_service/` — Spring Boot 4 courses / modules / lessons / assets. Port `8081`. RabbitMQ producer.
- `learning_service/` — Spring Boot 4 enrollments / certificates / study activity. Port `8082`.
- `answer_service/` — Python 3.12 FastAPI RAG service (ChromaDB + OpenAI + RabbitMQ).
- `frontend/` — React 19 + Vite + Redux Toolkit + Tailwind 4.

Inter-service contracts: REST through the gateway, RabbitMQ events between services. Identifiers are UUIDs. There is no shared schema or shared code.

## Universal Rules

1. **Architecture is fixed.** Java + Python services follow Clean Architecture / DDD (`domain → application ← infrastructure → presentation`). Frontend follows Feature-Sliced Design. Never propose a different layout.
2. **Dependencies point inward.** `domain` has zero framework imports. `infrastructure` implements ports defined in `application`. `presentation` calls `application` handlers only.
3. **One operation per folder.** Use cases live in `application/interactors/<aggregate>/<operation>/`. HTTP endpoints live in `presentation/.../<operation>/{handlers,dto}/`. Do not collapse multiple use cases into one controller / service.
4. **Validate at boundaries.** Value objects validate in the constructor. Re-check business invariants in handlers. Trust internal calls.
5. **Tests are mandatory for application + domain logic.** Use Arrange / Act / Assert. Mirror `src/` structure under `tests/`.
6. **No commits, no pushes, no `--no-verify` without explicit user instruction.**

## Style

- Java: Lombok where consistent with existing files, MapStruct for mappers. Constructor injection. Records for DTOs / value objects where appropriate. No field injection.
- Python (`answer_service`): full type annotations, no `typing.Any`, Ruff format, mypy strict, Dishka for DI.
- Frontend: function components, JS / JSX (no TypeScript), Redux Toolkit slices, Tailwind utility classes.
- All: no emoji in code or comments. No multi-paragraph docstrings. Comments only when the WHY is non-obvious.

## Validation Bar

| Service           | Minimum after edit                  | Before commit                       |
|-------------------|-------------------------------------|-------------------------------------|
| Java services     | `./gradlew build`                   | `./gradlew check`                   |
| `answer_service`  | `just lint`                         | `just static-analysis` + `pytest -v`|
| `frontend`        | `npm run lint`                      | `npm run lint` + `npm run build`    |

## When in Doubt

- Read the per-service `AGENTS.md` for layer boundaries and naming conventions.
- Read the per-service `CLAUDE.md` for elaboration with examples.
- Read `.cursor/rules/clean-architecture.mdc`, `ddd.mdc`, `tdd.mdc` for cross-cutting principles.
- If a rule and the surrounding code disagree, ask before refactoring. Existing code is usually right; the rule may be out of date.
