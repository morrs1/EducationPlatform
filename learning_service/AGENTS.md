# AGENTS.md

## Scope

This file applies to everything under `learning_service/`.

`learning_service` is the Spring Boot microservice that tracks user learning progress for the Education Platform: course enrollments, lesson completions, daily study activity, and earned certificates. It owns no course content and no user identity — it only references `userId`, `courseId`, and `lessonId` as opaque UUIDs from `user_service` and `course_service`. There is no shared database schema with sibling services.

## Project Snapshot

Spring Boot service built around Clean Architecture / DDD layering.

```
+----------------+--------------------------------------------------+
| Item           | Value                                            |
+----------------+--------------------------------------------------+
| Language       | Java 25 (toolchain)                              |
| Framework      | Spring Boot 4.0.6                                |
| Build system   | Gradle (Groovy DSL, build.gradle)                |
| Web            | spring-boot-starter-webmvc                       |
| Persistence    | spring-boot-starter-data-jpa, PostgreSQL driver  |
| Migrations     | Liquibase (deploy/liquibase/)                    |
| API docs       | springdoc-openapi-starter-webmvc-ui 3.0.3        |
| Tooling        | Lombok (compile-only + annotation processor)     |
| Tests          | spring-boot-starter-test, JUnit 5, H2 (runtime)  |
| Root package   | org.example.learning_service                     |
| Default port   | 8082                                             |
+----------------+--------------------------------------------------+
```

The whole codebase follows the layering below. Treat these layers and their public ports as the source of truth.

```
src/main/java/org/example/learning_service/
  domain/            -- pure business model, no Spring, no JPA
    base/            -- BaseEntity, BaseValueObject, BaseDomainService, base/exceptions/
    enrollment/      -- Enrollment aggregate + LessonCompletion, vo/, services/
    certificate/     -- Certificate aggregate + services/
    activity/        -- UserStudyDay aggregate + services/
  application/       -- use cases, ports, application exceptions
    ports/           -- EnrollmentRepo, CertificateRepo, StudyActivityRepo, TransactionManager
    interactors/<aggregate>/<operation>/
    exceptions/      -- application-level exceptions
    certificate/     -- CertificateStubS3Url (stub, see Architecture Rules)
  infrastructure/    -- adapters that bridge ports to Spring/JPA
    adapters/persistence/      -- *RepoJpaAdapter
    adapters/transactions/     -- SpringTransactionManagerAdapter
    persistence/repositories/  -- Spring Data interfaces (*SpringDataRepo)
    persistence/mappers/       -- domain <-> JPA mappers (*PersistenceMapper)
    persistence/models/<aggregate>/  -- Hibernate* JPA entities
  presentation/http/v1/ -- REST controllers (handlers) per use case
    <aggregate>/<operation>/dto + handlers/
    exception_handlers/ -- ApiExceptionHandler, ErrorResponse
    mappers/            -- *MapperQuery (view -> response DTO)
  setup/config_beans/<aggregate>/ -- @Configuration wiring ports to adapters
LearningServiceApplication.java   -- @SpringBootApplication entry point
```

## Architecture Rules

Dependency flow is strictly inward: `presentation -> application -> domain`, with `infrastructure` implementing `application/ports` interfaces.

- `domain/` is pure Java. Do not import Spring, Jakarta Persistence (`jakarta.persistence.*`), Jackson, or anything web-related in this package. Domain entities extend `domain/base/BaseEntity`, value objects extend `domain/base/BaseValueObject`, domain services extend `domain/base/BaseDomainService`, and validation failures throw `domain/base/exceptions/ValidateException`.
- `application/interactors/<aggregate>/<operation>/` holds one use case per folder. A use case folder typically contains: `<Operation>Command` (input record), `<Operation>Interactor` (orchestration), and `<Operation>View` (output record, when the use case returns data). Match the conventions in `application/interactors/enrollment/enroll_user_in_course/`.
- All side effects in interactors run inside `TransactionManager.inTransaction(...)`. Do not annotate interactors with `@Transactional` — they are POJOs created in `setup/config_beans/...` and the boundary is the port.
- All persistence and infrastructure access from an interactor must go through `application/ports/*Repo` or `TransactionManager`. Never inject a Spring Data repository or `EntityManager` directly into an interactor.
- `application/exceptions/` holds use-case-level failures (`EnrollmentNotFoundException`, `EnrollmentAlreadyExistsException`, `CertificateNotFoundException`, `CertificateAlreadyExistsForEnrollmentException`). Map them to HTTP codes only in `presentation/http/v1/exception_handlers/ApiExceptionHandler`.
- `application/certificate/CertificateStubS3Url` is a placeholder for an S3 file URL. There is no real S3 integration yet. Do not assume an object storage client exists; if you wire one up, replace the stub deliberately and document it.
- `infrastructure/adapters/persistence/<Aggregate>RepoJpaAdapter` implements the corresponding `application/ports/<Aggregate>Repo`. It delegates to `infrastructure/persistence/repositories/<Aggregate>SpringDataRepo` and translates with `infrastructure/persistence/mappers/<Aggregate>PersistenceMapper`. Keep that triangle: port -> JPA adapter -> Spring Data repo -> mapper -> domain.
- JPA entities live in `infrastructure/persistence/models/<aggregate>/` and are named `Hibernate<Name>` (`HibernateEnrollment`, `HibernateLessonCompletion`, `HibernateCertificate`, `HibernateUserStudyDay`, `HibernateUserStudyDayId`). Do not leak Hibernate types into the domain or application layer.
- `spring.jpa.hibernate.ddl-auto: validate` is intentional. Schema changes must ship as Liquibase changesets under `deploy/liquibase/changelog/`. Do not regenerate the schema from entities.
- `spring.jpa.open-in-view: false` is intentional. Do not rely on lazy loading outside a transaction; load what the use case needs while the transaction is open.
- Controllers live in `presentation/http/v1/<aggregate>/<operation>/handlers/<Operation>Handler.java`. One `@RestController` per use case. They depend only on an interactor and the matching `*MapperQuery`. Do not put business logic in a handler.
- HTTP DTOs live in `presentation/http/v1/<aggregate>/<operation>/dto/`. Application views (`*View`) are mapped to response DTOs through `presentation/http/v1/mappers/<Aggregate>MapperQuery`. Do not return application views or domain entities from a controller.
- New use cases must be registered as `@Bean` in the matching `setup/config_beans/<aggregate>/<Aggregate>BeansConfig.java`. Interactors are not `@Component`; they are explicit beans wired with their ports and domain services.

## Coding Standards

- Java 25, records preferred for `Command`, `View`, and HTTP DTOs (request/response).
- Use Lombok where the rest of the codebase already uses it (e.g. `@RequiredArgsConstructor` on Spring-managed components). Do not introduce `@Data` on JPA entities.
- Folder and package names use `snake_case` for the operation segments under `interactors/` and under `presentation/http/v1/<aggregate>/` (see `enroll_user_in_course`, `complete_lesson`, `read_completed_lessons_for_course`, etc.). Class names stay `UpperCamelCase`. Keep the naming consistent with siblings when adding new operations.
- Handler base paths are fixed per aggregate:
  - certificate: `/learning/certificate`
  - enrollment: `/learning/enrollment`
  - activity: `/learning/activity`
  Routes reach this service through `api_gateway` at `/api/learning/...`.
- OpenAPI annotations (`@Tag`, `@Operation`, `@ApiResponses`) are part of the handler contract. Match the existing Russian summaries/descriptions when extending an existing tag, and keep tags stable (`Learning certificate`, `Learning enrollment`, `Learning activity`).
- Time: store and accept `LocalDateTime` in UTC (Hibernate property `hibernate.jdbc.time_zone: UTC` is set). Do not introduce time-zone conversions inside the domain.
- Identifiers (`userId`, `courseId`, `lessonId`) are `UUID` and come from sibling services. Do not validate them against external systems here — there is no cross-service join.

## Practical Editing Rules

- Adding a new enrollment use case:
  1. Create `application/interactors/enrollment/<operation>/{<Operation>Command, <Operation>Interactor, <Operation>View}.java`.
  2. Extend `application/ports/EnrollmentRepo` only if a genuinely new repository method is needed; otherwise reuse existing port methods.
  3. Register the interactor as a `@Bean` in `setup/config_beans/enrollment/EnrollmentBeansConfig.java`.
  4. Add the matching `presentation/http/v1/enrollment/<operation>/{dto, handlers}` and a `*MapperQuery` mapping for the response.
  5. Add tests under `src/test/java/...` mirroring the package layout.
- Adding a new certificate or activity use case follows the same recipe under `application/interactors/certificate/...` or `application/interactors/activity/...`, registered in `CertificateBeansConfig` or `StudyActivityBeansConfig`.
- Schema changes: add a Liquibase changeset under `deploy/liquibase/changelog/v.<version>/` and reference it from `db.changelog-master.yaml`. Update the matching `Hibernate*` entity and `*PersistenceMapper`. Keep `ddl-auto: validate`.
- New cross-cutting infrastructure (S3, message brokers, external HTTP) must be modelled as a port in `application/ports/`, implemented in `infrastructure/adapters/`, and wired in `setup/config_beans/`. Do not call infrastructure from interactors directly.
- Do not edit:
  - `build/`, `.gradle/`, generated Lombok output
  - Files under `gradle/wrapper/` unless you are upgrading Gradle deliberately
- Treat `.DS_Store` files as irrelevant.

## Validation

Run from `learning_service/`.

```
./gradlew build
./gradlew test
./gradlew bootRun
```

- Small, isolated change inside one use case: `./gradlew test`.
- Schema, port, or wiring change: `./gradlew build` (compiles, validates Spring context if tests cover it).
- Tests use H2 with `MODE=PostgreSQL` driven by `src/test/resources/application-test.yaml` and `ddl-auto: create-drop`. Production uses PostgreSQL with `ddl-auto: validate` — keep the H2 test profile honest by mirroring Liquibase-applied columns in entities.
- Swagger UI: `http://localhost:8082/swagger-ui.html`. OpenAPI JSON: `http://localhost:8082/v3/api-docs`.

## Good Defaults for Agents

- Preserve the layered split. Do not flatten an interactor into a controller, do not move JPA annotations into `domain/`, and do not call Spring Data repositories from `application/`.
- When extending an aggregate, prefer adding behaviour to the existing domain entity or domain service rather than to the interactor.
- Keep Russian text in OpenAPI annotations and error messages consistent with the surrounding handler when extending existing endpoints.
- If you find yourself reaching for `S3`, certificate files, or anything binary, remember `CertificateStubS3Url` is a stub — discuss the integration before wiring it.
- Prefer small, local edits that fit the existing structure over restructuring whole packages.
