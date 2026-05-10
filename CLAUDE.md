# CLAUDE.md

This file is for **Claude Code** and any AI assistant compatible with `CLAUDE.md` discovery. It is the entry point for the whole repository. For per-service rules, open the `CLAUDE.md` (or `AGENTS.md`) inside that service.

`CLAUDE.md`, `AGENTS.md`, and the per-tool config files (`.cursor/rules/*.mdc`, `.github/copilot-instructions.md`, `.windsurfrules`) are kept consistent. If you change a rule, update all of them — they encode the same intent for different tools.

## Project

Polyglot microservice monorepo for an education platform.

| Directory          | Stack                                      | Role                                             |
|--------------------|--------------------------------------------|--------------------------------------------------|
| `api_gateway/`     | Java 25, Spring Boot 4, Gradle             | Auth, authorization, reverse proxy               |
| `user_service/`    | Java 25, Spring Boot 4, PostgreSQL         | User identity, auth, profile, roles              |
| `course_service/`  | Java 25, Spring Boot 4, PostgreSQL, RabbitMQ, S3 | Courses, modules, lessons, assets          |
| `learning_service/`| Java 25, Spring Boot 4, PostgreSQL         | Enrollments, certificates, study activity        |
| `answer_service/`  | Python 3.12, FastAPI, ChromaDB, OpenAI     | RAG: answers grounded in lesson content          |
| `frontend/`        | React 19, Vite, Redux Toolkit, Tailwind 4  | Web client (Feature-Sliced Design)               |

Inter-service communication: **REST** through the gateway, **RabbitMQ** for domain events. Identity is by UUID — no shared schema, no shared code.

## Non-negotiable Rules

These apply everywhere unless a per-service file explicitly overrides them.

1. **Respect existing architecture.** Java services follow Clean Architecture / DDD (`domain → application ← infrastructure → presentation`). `answer_service` follows the same in Python. `frontend` follows Feature-Sliced Design (FSD). Do not invent a new layout.
2. **Dependencies point inward.** `presentation → application → domain`. `infrastructure` depends on `application` (via ports), never the other way. The `domain` layer has zero framework imports.
3. **Use ports for all I/O.** Every database call, HTTP client, file storage, message bus, LLM call goes through an `application/ports/` interface implemented by an adapter in `infrastructure/`.
4. **Per-operation folders in `application/` and `presentation/`.** One use case per directory: `application/interactors/<aggregate>/<operation>/` and `presentation/.../<operation>/{handlers,dto}/`. Do not lump multiple operations into one giant controller or service.
5. **Validate at boundaries, trust internally.** Value objects validate in their constructor. Application handlers re-check business invariants. Internal helpers trust their inputs.
6. **No backwards-compat shims, no premature abstraction.** If unused code is found, remove it. Three similar lines is better than a wrong abstraction.
7. **Comment the why, not the what.** Code explains what; comments explain non-obvious why (workarounds, invariants, surprising decisions).
8. **Do not commit without explicit user instruction.** Never push without explicit user instruction.

## Validation Bar

| Service           | Minimum after edit                       | Before commit             |
|-------------------|------------------------------------------|---------------------------|
| Java services     | `./gradlew build`                        | `./gradlew check`         |
| `answer_service`  | `just lint`                              | `just static-analysis` + `pytest -v` |
| `frontend`        | `npm run lint`                           | `npm run lint` + `npm run build` |

Fix all type errors and lint warnings before moving on. Never bypass hooks (`--no-verify`, etc.) without the user explicitly asking for it.

## Detailed Guidance

For the deeper rules, read in this order:

1. The service's own `AGENTS.md` — layer boundaries, where to put new code, validation bar.
2. The service's own `CLAUDE.md` — Claude-specific elaboration, examples, gotchas.
3. `.cursor/rules/clean-architecture.mdc`, `.cursor/rules/ddd.mdc`, `.cursor/rules/tdd.mdc` — cross-cutting principles.

## Repository Layout

```
EducationPlatformAll/
├── AGENTS.md                    # Codex / generic agent spec
├── CLAUDE.md                    # this file
├── README.md                    # human overview
├── .cursor/rules/               # Cursor MDC rules (repo-wide)
├── .github/
│   ├── copilot-instructions.md  # GitHub Copilot, always applied
│   └── instructions/            # Copilot scoped instructions (applyTo)
├── api_gateway/        # Spring Boot, port 8090
├── user_service/       # Spring Boot, port 8080
├── course_service/     # Spring Boot, port 8081
├── learning_service/   # Spring Boot, port 8082
├── answer_service/     # Python FastAPI
└── frontend/           # React + Vite
```

## Doing Tasks

- Run `git status --short` before editing — there may be in-progress work on this branch.
- When unsure which service a change belongs in, ask. Cross-service changes need to be split per service, with separate commits or a clear linear diff.
- Prefer editing existing files over creating new ones. Do not create `README.md` / `AGENTS.md` / `CLAUDE.md` unless the user asks.
- Use real ports and adapters, not mocks-in-prod. Mocks belong in tests.
