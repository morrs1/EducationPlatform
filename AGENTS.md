# AGENTS.md

## Scope

This file applies to the whole repository.

## Repository Layout

The repository is a polyglot multi-service monorepo. Each top-level directory is an independent service with its own build system and its own `AGENTS.md` covering local rules. Always read the per-service `AGENTS.md` before editing inside that service.

Top-level areas:

- `frontend/` — React 19 + Vite client. See `frontend/AGENTS.md`.
- `api_gateway/` — Spring Boot Java gateway: auth, authorization, reverse proxy. See `api_gateway/AGENTS.md`.
- `user_service/` — Spring Boot Java service: user identity, auth, profile, roles, photo. See `user_service/AGENTS.md`.
- `course_service/` — Spring Boot Java service: courses, modules, lessons, assets. See `course_service/AGENTS.md`.
- `learning_service/` — Spring Boot Java service: enrollments, lesson completions, certificates, study activity. See `learning_service/AGENTS.md`.
- `answer_service/` — Python FastAPI RAG service (vector search + LLM). See `answer_service/AGENTS.md` and `answer_service/CLAUDE.md`.

## Service Ports (local dev)

| Service           | Port |
|-------------------|------|
| `api_gateway`     | 8090 |
| `user_service`    | 8080 |
| `course_service`  | 8081 |
| `learning_service`| 8082 |
| `answer_service`  | 8080 (HTTP, separate process; see service docs) |
| `frontend`        | Vite default (5173) |

The gateway is the single public entry point: `/api/user/**`, `/api/course/**`, `/api/learning/**` are routed to the corresponding services. `answer_service` is currently not routed through the gateway.

## Root Rules

- The repo root is **not** a Node workspace. There is no root `package.json`. Run frontend commands inside `frontend/`.
- Each Java service is a standalone Gradle project. Run `./gradlew` from inside that service's directory.
- `answer_service/` is a Python project managed by `uv` with a `justfile`. Run its commands from inside `answer_service/`.
- Run `git status --short` before editing — branches may already contain in-progress refactors.
- Treat `.DS_Store`, `node_modules/`, `dist/`, `build/`, `.gradle/`, `.venv/` as irrelevant unless the user explicitly mentions them.

## Cross-Service Conventions

- All Java services follow the same Clean Architecture / DDD layering: `domain → application ← infrastructure → presentation`. The exact base classes (`BaseEntity`, `BaseValueObject`, …) are per-service; do not import across service boundaries.
- Inter-service references are by UUID only. No shared schema, no shared JPA entities.
- Domain events leave a service via an **outbox table** committed in the same transaction; a relay (Spring scheduler in Java services, TaskIQ in `answer_service`) publishes them to RabbitMQ.
- `course_service` is the producer of lesson events that `answer_service` indexes for RAG.
- `user_service` is the source of truth for user identity. Other services keep thin projections by `userId`.
- `api_gateway` issues the gateway JWT after delegating credentials to `user_service`. Downstream services trust the gateway's `AuthenticatedPrincipal`.

## Validation Hints by Service

| Service           | Minimum check after edit                            |
|-------------------|-----------------------------------------------------|
| `frontend`        | `npm run lint` (and `npm run build` for big edits)  |
| Java services     | `./gradlew build`                                   |
| `answer_service`  | `just lint`; `just static-analysis` before commit   |

See each service's `AGENTS.md` for the full validation matrix.
