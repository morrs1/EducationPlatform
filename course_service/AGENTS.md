# AGENTS.md

## Scope

This file applies to everything under `course_service/`.

## Project Snapshot

`course_service` is a Spring Boot microservice that owns the course catalog of the Education Platform: courses, modules, lessons, typed lesson content, lesson assets (S3), and tags. It does NOT track user progress — that belongs to `learning_service`.

Stack:

- Java 25 (Gradle toolchain), Gradle Kotlin DSL
- Spring Boot 4.0.5 (WebMVC, Data JPA, JDBC, AMQP)
- PostgreSQL + Liquibase migrations under `deploy/liquibase/`
- RabbitMQ (publisher only — outbox relay)
- AWS SDK S3 v2 (lesson assets, SeaweedFS-compatible)
- MapStruct 1.6.3, Lombok, Jackson
- Springdoc OpenAPI / Swagger UI
- Java package root: `com.example.course_service`
- HTTP port: `8081`. Reached via `api_gateway` at `/api/course/...`.

The codebase follows Clean Architecture / DDD with strict inward-only dependencies. Treat the layer split below as the source of truth.

```
presentation -> application -> domain
                    ^
              infrastructure
```

Top-level packages under `com.example.course_service`:

- `domain/` — pure business logic. No Spring, no JPA, no Jackson.
- `application/` — use case interactors, ports, application-level exceptions.
- `infrasructure/` — adapters that implement application ports. **The directory name has a typo (`infrasructure`, not `infrastructure`). Do not rename it without a coordinated migration; many imports depend on it.**
- `presentation/http/v1/` — REST controllers, request/response DTOs, mappers, exception handlers.
- `setup/` — Spring `@Configuration` classes that wire interactors and adapters into beans. Note the existing folder `setup/config_beans/transations/` keeps an additional typo — preserve it.

## Architecture Rules

### Layer boundaries (do not violate)

- `domain/` must not import anything from `application/`, `infrasructure/`, `presentation/`, or `setup/`. No Spring annotations, no JPA annotations, no Jackson annotations on domain classes.
- `application/` may import `domain/` only. Use cases depend on **ports** (interfaces in `application/ports/`), never on concrete adapters.
- `infrasructure/` implements ports declared in `application/ports/`. It is the only layer allowed to use Hibernate, AWS SDK, RabbitTemplate, JDBC, etc.
- `presentation/http/v1/` calls interactors. It must not call repositories or adapters directly. It must not import domain VOs into request/response DTOs.
- `setup/` is the only place that constructs interactors and wires adapters as Spring beans (`@Bean` factory methods). Keep `@Configuration` per concern (`asset`, `course`, `lesson`, `brokers/rabbitMQ`, `s3`, `serialization`, `transations`).

### Domain-layer rules

- Entities and aggregate roots extend `com.example.course_service.domain.base.BaseEntity` (provides `UUID id`, equality by id).
- Value objects extend `com.example.course_service.domain.base.BaseValueObject` and implement `validate()` throwing `ValidateException`. Put VOs under `domain/<aggregate>/vo/`.
- Domain services extend `com.example.course_service.domain.base.BaseDomainService`. They are stateless except for the inherited `events` queue. Emit events via `recordEvent(...)`. Use cases pull them with `domainService.pullEvents()` and hand them to `EventBus`.
- Domain events extend `com.example.course_service.domain.base.BaseDomainEvent`. Lesson events go under `domain/lesson/events/`. Lesson payload types go under `domain/lesson/payload/`.
- Aggregates currently in the model: `Course`, `Module`, `Lesson`, `LessonPreview`, `Asset`, `Tag`, `OutboxMessage`. Add a new aggregate as `domain/<aggregate>/<Aggregate>.java` plus `vo/` and `services/` subfolders if needed.

### Application-layer rules

- Use cases live one-per-folder under `application/interactors/<aggregate>/<operation>/`. Existing operations include:
  - `course/`: `add_course`, `add_module_to_course`, `publish_course`, `read_all`, `read_course_by_id`, `read_courses_by_author`, `search_courses`
  - `lesson/`: `add_lesson`, `read_lesson_by_id`, `upload_content`
  - `asset/`: `add_asset_to_lesson`
- Each use case folder typically contains:
  - `<Operation>Command.java` (input record) for write paths, or no command for read paths that take primitives.
  - `<Operation>Interactor.java` (the use case class).
  - `<Operation>View.java` and/or `views/` package for output DTOs returned to the presentation layer.
- Read-side view shaping helpers live in `application/interactors/mappers/` (`CourseViewMapper`, `LessonViewMapper`).
- Ports live flat under `application/ports/`: `CourseRepo`, `LessonRepo`, `AssetRepo`, `AssetFileStorage`, `OutboxRepo`, `EventBus`, `TransactionManager`, `LessonPayloadMapper`. Add new ports here as plain Java interfaces. **Never reference Spring/Hibernate types in ports.**
- Application exceptions live flat under `application/exceptions/`: `CourseNotFoundException`, `LessonNotFoundException`, `ModuleNotFoundException`, `TagNotFoundException`, `InvalidLessonContentException`. Throw these from interactors; map them to HTTP codes in `presentation/http/v1/exceptions_handlers/`.
- Wrap write paths in `transactionManager.inTransaction(() -> { ... })`. Within the same transaction, persist aggregate changes and call `eventBus.publish(domainService.pullEvents())`. The `EventBus` adapter writes to `OutboxRepo`; `OutboxSpringScheduler` later relays messages to RabbitMQ.

### Infrastructure-layer rules

- JPA entities live in `infrasructure/persistence/models/<aggregate>/Hibernate<Aggregate>.java`.
- Spring Data JPA repos live in `infrasructure/persistence/repositories/`.
- Domain <-> JPA mapping lives in `infrasructure/persistence/mappers/` (MapStruct or hand-written; see `CourseHibernateMapper`, `LessonHibernateMapper`, `AssetHibernateMapper`, `OutboxMessageHibernateMapper`).
- Port implementations live under `infrasructure/adapters/<concern>/`:
  - `persistence/` — `HibernateCourseRepo`, `HibernateLessonRepo`, `HibernateAssetRepo`, `HibernateOutboxRepo`
  - `file_storage/` — `SeaweedFSLessonAssetRepo` (implements `AssetFileStorage`)
  - `event_bus/` — `SpringEventBus`
  - `event_handlers/` — `LessonEventsHandler`, outbox payload DTOs (Jackson)
  - `transactions/` — `SpringTransactionManagerAdapter`
- The outbox relay lives in `infrasructure/schedulers/OutboxSpringScheduler` with `@Scheduled(fixedRate = 5000)`. Scheduling is enabled in `setup/SpringConfig` via `@EnableScheduling`.
- Lesson content payloads cross the JSON boundary via `LessonPayloadMapper` (port) and its Jackson adapter `JacksonLessonPayloadMapper` in `infrasructure/persistence/mappers/`.

### Presentation-layer convention

For every HTTP operation use the existing layout:

```
presentation/http/v1/handlers/<aggregate>/<operation>/
    <Operation>Handler.java          # @RestController, single endpoint
    <Operation>Request.java          # request body record (if any)
    <Operation>Response.java         # response body record (if any)
    dto/
        request/                     # nested request DTOs (e.g. AddAssetRequest, CourseTagRef)
        response/                    # nested response DTOs (e.g. ModuleResponse, TagResponse)
```

Concrete examples in the codebase:

- `handlers/course/add_course/AddCourseHandler.java` + `AddCourseRequest.java` + `CourseTagRef.java`
- `handlers/course/read_by_id/ReadCourseByIdHandler.java` + `dto/response/{ReadCourseByIdResponse, ModuleResponse, LessonPreviewResponse, TagResponse}.java`
- `handlers/lesson/upload_content/UploadLessonContentHandler.java` + `UploadLessonContentRequest.java`
- `handlers/lesson/read_by_id/ReadLessonByIdHandler.java` + `dto/response/*` (typed lesson content responses)
- `handlers/asset/add_asset/AddAssetHandler.java` + `AddAssetResponse.java` (with the request DTO living in `course/read_by_id/dto/request/AddAssetRequest.java` for historical reasons — do not duplicate it)

Handler conventions:

- Each handler is a `@RestController` with `@RequestMapping("/course")` (courses, modules) or `@RequestMapping("/course/lesson")` (lessons, assets). The base path is always `/course`.
- One endpoint method per handler class. New operations go into a new handler file, not into an existing one.
- Annotate every endpoint with Springdoc `@Operation`, `@ApiResponses`, and `@Tag` (`Courses`, `Lessons`, or `Assets`).
- Use MapStruct mappers in `presentation/http/v1/mappers/` (`CourseMapperCommand`, `CourseMapperQuery`, `LessonMapperCommand`, `LessonMapperQuery`) to translate between DTOs and application commands/views. Do not pass domain types through the HTTP boundary.
- Multipart endpoints set `consumes = MediaType.MULTIPART_FORM_DATA_VALUE`. Multipart limits are 200MB.
- Map application/domain exceptions to HTTP codes via `@RestControllerAdvice` in `presentation/http/v1/exceptions_handlers/` returning `ErrorResponse`.

### Configuration / wiring

- For a new interactor: add a `@Bean` factory in the matching `setup/config_beans/<aggregate>/<Aggregate>Config.java`. Inject the port implementations Spring already exposes (e.g. `HibernateCourseRepo`, `TransactionManager`).
- For a new port adapter: add an adapter class under `infrasructure/adapters/...` and either annotate it with `@Component`/`@Repository` or expose it as a `@Bean` from a config in `setup/config_beans/`.
- Environment variables and `application.yaml` placeholders: see README. Do not hard-code S3 credentials or DB credentials.

### Eventing / outbox

- Domain events recorded by domain services are published through `EventBus`. The current implementation persists them as `OutboxMessage` rows inside the same transaction.
- `OutboxSpringScheduler` reads unprocessed rows every 5 seconds and publishes their payloads to RabbitMQ with routing key `lesson.created` (default exchange). `answer_service` consumes these for lesson (re)indexing.
- When introducing a new event type:
  1. Add the event class under `domain/<aggregate>/events/`.
  2. Have the relevant domain service `recordEvent(...)`.
  3. Map it to an outbox payload DTO under `infrasructure/adapters/event_handlers/`.
  4. If a new routing key is needed, extend `OutboxSpringScheduler` rather than introducing a parallel scheduler.

## Coding Standards

- Use Lombok (`@Getter`, `@Setter`, `@RequiredArgsConstructor`, `@EqualsAndHashCode`, `@ToString`) consistently with the surrounding code. Aggregate equality is by id (see `BaseEntity`).
- Prefer Java `record` for DTOs and commands. Use classes for entities and VOs (so they can extend the base classes).
- MapStruct interfaces for mappers; do not write manual stream-mapper boilerplate when MapStruct can express it.
- Validate at construction time in domain VOs and entities. Throw `ValidateException` (or a more specific subclass) — never `IllegalArgumentException` from domain code.
- Do not introduce new top-level packages without a strong reason. Match existing folder naming, including the `infrasructure` and `transations` typos.
- Migrations: every schema change requires a new Liquibase changelog under `deploy/liquibase/changelog/v.<version>/` plus an entry in `db.changelog-master.yaml`.

## Validation

Run all commands from `course_service/`.

```sh
./gradlew bootRun     # run the service on :8081
./gradlew build       # compile + run tests
./gradlew test        # tests only
```

Validation expectations:

- domain/application change: `./gradlew test`
- new endpoint or DTO: `./gradlew build` (so the compiler / annotation processors / MapStruct catch wiring problems)
- migration change: bring up local Postgres from `deploy/postgres/docker_compose_course_service.yaml`, then run `./gradlew bootRun` and verify Liquibase applies cleanly.

There is currently no enforced static analysis configuration in this Gradle build — do not claim Checkstyle/Spotless/Sonar coverage unless you add it.

## Practical Editing Rules

- Check `git status --short` before editing. The course module has had recent structural changes (see recent commits).
- Do not edit:
  - `build/`
  - `.gradle/`
  - generated MapStruct sources under `build/generated/`
- Do not rename the `infrasructure` package or the `setup/config_beans/transations` folder — both names contain known typos that the rest of the codebase imports against. A rename must be a dedicated, isolated change.
- Keep handler base path as `/course` (the `api_gateway` adds `/api`).
- When adding S3-backed features, reuse `S3Client` and `SeaweedFSConnectionInfo` exposed by `setup/config_beans/s3/SeaweedFSBeansConfig` rather than constructing a new client.
- When adding a new use case end-to-end, expect to touch all four layers: `domain/` (if new behavior), `application/interactors/<aggregate>/<operation>/`, an adapter in `infrasructure/`, a handler in `presentation/http/v1/handlers/<aggregate>/<operation>/`, and a `@Bean` in `setup/config_beans/<aggregate>/`.

## Good Defaults for Agents

- Prefer adding a new interactor folder over extending an existing one to keep use cases single-purpose.
- Treat ports as the contract — when a use case needs new infrastructure, add a method on the relevant `*Repo` (or a new port) before touching the adapter.
- Wrap writes in `TransactionManager.inTransaction` and publish events at the end of the unit of work; do not publish events outside a transaction.
- Map domain types to view records inside the application layer (`interactors/mappers/`); map view records to HTTP response DTOs inside the presentation layer (`presentation/http/v1/mappers/`). Keep the two concerns separate.
- Prefer extending the existing OpenAPI annotations (`@Operation`, `@ApiResponses`, `@Tag`) on new endpoints so Swagger UI stays accurate.
- If a change crosses service boundaries (e.g. a new lesson event consumed by `answer_service`), update both the producer here and the consumer there in the same PR.
