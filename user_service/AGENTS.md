# AGENTS.md

## Scope

This file applies to everything under `user_service/`.

`user_service` is the source of truth for user identity in the EducationPlatform monorepo. It owns registration, password verification, profile data, role assignment, and profile photo storage. The `api_gateway` is the only consumer that turns a successful login into a JWT — this service itself does not issue or validate tokens.

## Project Snapshot

Spring Boot service following Clean Architecture and DDD, written in Java 25.

Tech stack:

| Layer            | Tool                                                          |
|------------------|---------------------------------------------------------------|
| Language         | Java 25                                                       |
| Framework        | Spring Boot 4.0.3                                             |
| Build            | Gradle Kotlin DSL                                             |
| Persistence      | Spring Data JPA + Spring JDBC, PostgreSQL                     |
| Migrations       | Liquibase (`deploy/liquibase/`)                               |
| Web              | Spring WebMVC                                                 |
| Password hashing | `spring-security-crypto` (BCrypt only, no HTTP security)      |
| Object storage   | AWS SDK S3 against SeaweedFS (`temp.s3.*`)                    |
| Docs             | Springdoc OpenAPI + Swagger UI                                |
| Mapping          | MapStruct 1.6.3                                               |
| Boilerplate      | Lombok                                                        |
| Tests            | JUnit 5 (Spring Boot Test)                                    |

Package root: `org.example.user_service`. HTTP port: `8080`. Multipart upload limit: 10MB.

Source layout:

```
src/main/java/org/example/user_service/
  domain/
    base/                         BaseEntity, BaseValueObject, BaseDomainEvent,
                                  BaseDomainService, base/exceptions/
    user/
      User.java                   aggregate root
      events/                     CreateUserDomainEvent, ...
      ports/                      PasswordHasher (domain-owned port)
      services/                   UserDomainService
      vo/                         UserId, UserEmail, UserName, UserSurname,
                                  UserPatronymic, UserStatus, UserPassword,
                                  UserProfilePhotoLink, UserRole
  application/
    exceptions/                   UserNotFoundException, UserAlreadyExistsException,
                                  InvalidCredentialsException
    ports/                        UserRepo, PhotoStorage, EventBus, TransactionManager
    interactors/
      mappers/UserViewMapper
      user/<operation>/           one folder per use case
        create_user/
        authenticate_user/
        read_user_by_id/
        update_user/              ChangeUserName/Surname/Patronymic/Status commands
        assign_role/
        add_profile_photo/
  infrastructure/
    adapters/
      persistence/                HibernateUserRepo (JPA adapter for UserRepo)
      password_hasher/            PasswordHasherBcrypt (BCrypt adapter)
      s3/                         SeaweedFSUserProfilePhotoRepo (PhotoStorage adapter)
      event_bus/                  SpringEventBus
      transactions/               SpringTransactionManagerAdapter
    event_handlers/               UserEventHandler (@EventListener)
    persistence/
      models/HibernateUser        JPA entity (table `users`)
      mappers/UserMapperHibernate domain <-> JPA mapping (MapStruct)
  presentation/http/v1/
    user/
      create/{dto,handlers}/      POST /user
      auth/{dto,handlers}/        POST /user/auth/register, POST /user/auth/login
      read_by_id/{dto,handlers}/  GET  /user
      update_user/{dto,...}/      PATCH /user/{id}/change_name, /change_surname,
                                  /change_patronymic, /change_status
      assign_role/                PATCH /user/{id}/assign_author, /assign_admin
      add_profile_photo/          POST /user/add_photo (multipart)
    mappers/                      UserMapperCommand, UserMapperQuery (MapStruct)
    exceptionHandlers/            ApiExceptionHandler, ErrorResponse
    exception/                    EmptyFileException
  setup/config_beans/
    user/                         UserBeansConfig (wires interactors)
    s3/                           SeaweedFSBeansConfig, SeaweedFSConnectionInfo
    transaction/                  TransactionalBeansConfig
    openapi/                      OpenApiConfig
  UserServiceApplication.java     @SpringBootApplication entry point

src/main/resources/application.yaml
src/test/java/...                 JUnit 5 tests for interactors
deploy/
  liquibase/changelog/            v.1.0.0/init.sql, v.1.0.1, v.1.0.2, v.1.0.3
  postgres/                       docker-compose for the user_service DB
  redis/                          docker-compose for local Redis
  s3/                             docker-compose for SeaweedFS + local data dir
docs/                             reference DB schemas for sibling services
```

## Architecture Rules

Dependencies flow inward only:

```
presentation -> application -> domain
                    ^
              infrastructure
```

- `domain/` has no Spring, no JPA, no AWS, no Jackson. It must be pure Java.
- `application/` orchestrates use cases. It owns `ports/` (interfaces). It must not import anything from `infrastructure/` or `presentation/`.
- `infrastructure/` implements application ports and the single domain port (`PasswordHasher`). Adapters are wired as Spring beans.
- `presentation/` only depends on `application/` interactors plus its own DTOs and MapStruct mappers. Controllers must not touch `UserRepo`, `PhotoStorage`, JPA, or S3 directly.
- All cross-layer boundaries pass primitive types, records, or domain objects — never JPA entities and never `MultipartFile` past the presentation layer (the controller pulls bytes out and passes a command into the interactor).

Layer-specific rules:

- `User` is the aggregate root. State mutation must go through `UserDomainService` (which records `BaseDomainEvent`s). Do not mutate `User` directly from an interactor.
- Value objects extend `BaseValueObject`. Validation lives in the VO constructor (e.g. `UserRole.validate()`). Do not duplicate validation in interactors or controllers.
- Domain events are dispatched via `EventBus` after a use case completes inside `TransactionManager.inTransaction(...)`. The current adapter is `SpringEventBus` (in-process `ApplicationEventPublisher`).
- `PasswordHasher` is a domain port; its only implementation `PasswordHasherBcrypt` lives in `infrastructure/adapters/password_hasher/`. BCrypt and any other crypto must stay in the adapter — the domain references only the interface.
- All S3 access goes through `PhotoStorage`. New file/blob features add methods to that port, with an adapter in `infrastructure/adapters/s3/`. Never call `S3Client` from `application/` or `presentation/`.
- Persistence uses JPA via `HibernateUserRepo` behind the `UserRepo` port. Domain <-> `HibernateUser` mapping goes through `UserMapperHibernate` (MapStruct). Do not leak `HibernateUser` outside `infrastructure/`.

## Where to add new code

Adding a new use case (command or query):

1. Create `application/interactors/user/<operation>/` with:
   - `<Operation>Command.java` (record) or query input
   - `<Operation>View.java` if a structured result is needed
   - `<Operation>Interactor.java` — constructor-injected dependencies, single public method, transactional via `TransactionManager.inTransaction(...)`
2. If the use case needs new infrastructure, declare a port in `application/ports/` (or extend an existing one) and implement it under `infrastructure/adapters/...`.
3. If the use case mutates state, add the operation to `UserDomainService` and record a `BaseDomainEvent` if it matters to other bounded contexts.
4. Wire the interactor as a `@Bean` in `setup/config_beans/user/UserBeansConfig`.
5. Add a controller folder under `presentation/http/v1/user/<operation>/` with `dto/` (records) and `handlers/`. Map DTO <-> command in `presentation/http/v1/mappers/UserMapperCommand` (or `UserMapperQuery` for read sides).
6. Annotate controllers with `@RestController`, `@RequestMapping("/user...")`, `@Tag(name = "Users", ...)`, and `@Operation(summary = "...")` for Swagger.

## Mapping conventions

- Two MapStruct mappers in `presentation/http/v1/mappers/`:
  - `UserMapperCommand` — request DTO -> application command
  - `UserMapperQuery` — application view -> response DTO
- One MapStruct mapper in `infrastructure/persistence/mappers/UserMapperHibernate` — domain `User` <-> `HibernateUser`.
- Use Lombok (`@RequiredArgsConstructor`, `@Getter`, `@Setter`, `@ToString`) on classes; let MapStruct generate the implementations. The Gradle build already wires `lombok-mapstruct-binding` so they cooperate.
- New DTOs should be `record`s in `presentation/http/v1/user/<op>/dto/`. New commands/views should be `record`s in `application/interactors/user/<op>/`.

## Coding Standards

- Java 25, no preview features.
- Constructor injection only. No `@Autowired` on fields.
- Lombok `@RequiredArgsConstructor` is the default for Spring components and interactors.
- Records for DTOs, commands, and simple views. Mutable classes are reserved for the `User` aggregate (it needs setters because the domain service mutates fields).
- Throw application exceptions (`UserNotFoundException`, `UserAlreadyExistsException`, `InvalidCredentialsException`) from interactors. Throw `ValidateException` from VO constructors. `ApiExceptionHandler` translates them to HTTP responses.
- Keep controller methods thin: parse DTO -> map to command -> call interactor -> map view to response. No business logic in controllers.
- Russian strings, log messages, and TODOs that already exist in the file should be preserved unless the task specifically asks to change them.

## Linting and formatting

Two complementary tools are wired into the Gradle build. Both run in CI and via pre-commit; never bypass them.

| Tool                       | What it does                                                                 | Gradle task                                                       |
|----------------------------|------------------------------------------------------------------------------|-------------------------------------------------------------------|
| **Spotless** (`6.25.0`)    | Removes unused imports, trims whitespace, enforces import order + EOF newline | `spotlessCheck` (verify) / `spotlessApply` (auto-fix)             |
| **Checkstyle** (`10.18.2`) | Static checks: naming, braces, modifier order, no star imports, no empty blocks, missing-override, etc. | `checkstyleMain`, `checkstyleTest`, `checkstyleIntegrationTest`   |

The Checkstyle config is at `config/checkstyle/checkstyle.xml`. It is intentionally lightweight — it catches real bugs and style smells without forcing a wholesale reformat of the existing codebase. Spotless handles whitespace + imports separately.

Run the linters from `user_service/`:

```sh
./gradlew spotlessCheck                      # verify formatting (CI-style)
./gradlew spotlessApply                      # auto-fix what it can
./gradlew checkstyleMain checkstyleTest checkstyleIntegrationTest
```

If a file is purposefully off-spec, mark it with `@SuppressWarnings("checkstyle:RuleName")` and explain why in a one-line comment. Do not edit `checkstyle.xml` to silence a single violation.

## Testing

Tests are mandatory for any change to `domain/`, `application/`, or `infrastructure/`. The full test suite must be green locally and in CI before reporting work done.

### Layout

```
src/test/java/org/example/user_service/
  support/
    factories/                                # Test data builders. Use these.
      UserFactory.java                        # User aggregate + Builder
      CreateUserCommandFactory.java
    fakes/                                    # In-memory port implementations.
      FakeUserRepo.java                       # UserRepo + tracking helpers
      FakePasswordHasher.java                 # plain hash/verify
      CountingPasswordHasher.java             # records call counts
      FakeEventBus.java                       # captures published events
      FakePhotoStorage.java                   # PhotoStorage with default view
      ImmediateTransactionManager.java        # runs the action synchronously
  domain/user/
    vo/<VO>Test.java                          # Value-object validation tests
    services/UserDomainServiceTest.java
  application/interactors/user/
    <operation>/<Operation>InteractorTest.java
src/integrationTest/java/org/example/user_service/
  support/integration/PostgresIntegrationTest.java   # Testcontainers base class
  infrastructure/adapters/persistence/
    HibernateUserRepoIT.java
```

### Unit-test rules

- **Use Arrange / Act / Assert with explicit comments.** Three blocks separated by `// Arrange`, `// Act`, `// Assert`. Combined `// Arrange + Act + Assert` is allowed for one-liners.
- **No Mockito for ports.** The in-memory fakes in `support/fakes/` are the standard. Reach for Mockito only if behavior cannot be expressed through a fake.
- **Use the factories.** `UserFactory.aUser()` / `UserFactory.builder()...build()` keep tests focused on what they actually exercise. Do not hand-roll `new User(UUID.randomUUID(), new UserSurname(...), ...)` in test methods — that hides the meaningful variation.
- **Name tests by behavior + expected outcome.** `shouldRejectDuplicateEmailWithoutSideEffects`, not `testCreate1`. JUnit `@DisplayName` is encouraged for the human-readable form.
- **AssertJ first.** `assertThat(...).isEqualTo(...)`. Avoid `assertEquals` in new code.
- **Parametrized tests** (`@ParameterizedTest` + `@ValueSource` / `@CsvSource`) for VO validation matrices.

### Integration-test rules

- Live in `src/integrationTest/java/...` (separate source set wired in `build.gradle.kts`).
- Use the `PostgresIntegrationTest` base class — it spins up a single Testcontainers PostgreSQL instance, shared across the JVM.
- Schema is materialised by Hibernate (`ddl-auto: create-drop` in `application-integration-test.yaml`). Do not depend on Liquibase changelogs from the integration tests; Liquibase runs separately in prod.
- Use `flush()` + `entityManager.clear()` between write and read steps to bypass the first-level cache and confirm the row actually round-trips through PostgreSQL.

### Commands

```sh
./gradlew test                # unit tests
./gradlew integrationTest     # Testcontainers integration tests (requires Docker)
./gradlew check               # spotlessCheck + checkstyle* + test + integrationTest
```

`./gradlew check` is the bar before commit and in CI.

If you touch an interactor under `application/interactors/user/<operation>/`, the matching `<Operation>InteractorTest` must be updated or extended. New interactors require a new test file in the same path.

## Validation Workflow

Use this order. Every step must pass before you call work done.

```sh
./gradlew spotlessApply       # auto-fix what is fixable
./gradlew spotlessCheck       # verify clean
./gradlew checkstyleMain checkstyleTest checkstyleIntegrationTest
./gradlew test integrationTest
./gradlew build               # full assemble + tests
```

Or, in one shot:

```sh
./gradlew check               # everything above except spotlessApply
```

## Pre-commit hooks

Hooks are managed by the `pre-commit` framework — the same one already used by `answer_service`. Install once per checkout:

```sh
pip install pre-commit         # or: pipx install pre-commit / brew install pre-commit
cd user_service
pre-commit install             # writes .git/hooks/pre-commit
pre-commit install --hook-type pre-push   # enables the pre-push test hook
```

What runs on `git commit` (only for files staged under `user_service/`):

1. **Hygiene hooks** — trailing whitespace, end-of-file newline, merge-conflict markers, YAML validity, large-file guard, line endings.
2. **Spotless format check** — fails if any Java file is not formatted.
3. **Checkstyle** — fails on any rule violation in main / test / integrationTest.

What runs on `git pre-push`:

4. **Unit tests** — `./gradlew test`.

Manual run on the whole tree:

```sh
pre-commit run --all-files
```

Never bypass hooks with `git commit --no-verify` or `git push --no-verify`. If a hook fails, fix the underlying issue and re-stage. If you need to disable a hook temporarily (e.g. work-in-progress branch), do it via configuration, not on the command line.

CI enforces the same checks (see `.github/workflows/user_service_ci.yaml`).

## Schema changes

- Add a new Liquibase changelog under `deploy/liquibase/changelog/v.<version>/` and reference it from `db.changelog-master.yaml`. Do not edit committed changelogs in place.

## Practical Editing Rules

- Run `git status --short` before editing — the repo is a polyglot monorepo and other services may be in flight.
- Do not edit:
  - `build/` (Gradle output)
  - `deploy/s3/data/seaweedfs/` (SeaweedFS volume data; treat as opaque local state)
  - `.gradle/`, `gradle/wrapper/`
- Do not commit a real `.env`; mirror new variables in `.env.example`.
- Do not introduce a second password hashing algorithm. If BCrypt parameters need to change, change them inside `PasswordHasherBcrypt`.
- Do not add Spring Security HTTP filters here. Authorization belongs in `api_gateway`; this service only verifies credentials via `AuthenticateUserInteractor`.
- The S3 adapter and its controller (`AddProfilePhotoHandler`) are guarded by `@ConditionalOnBean(SeaweedFSUserProfilePhotoRepo.class)` plus the `temp.s3.enabled` property. New S3-dependent endpoints should follow the same pattern so the service can boot without S3 configured.

## Good Defaults for Agents

- Default new HTTP routes to live under `/user/...`. The gateway routes to this service via `/api/user/...`, and additionally forwards `/auth/login` and `/auth/register` to the routes under `/user/auth/...`.
- Default new infrastructure to a port in `application/ports/` + adapter in `infrastructure/adapters/<tech>/`. Do not extend `User` or `UserDomainService` with framework types to avoid this.
- Default new errors to extending the existing application/domain exception hierarchy and adding a branch to `ApiExceptionHandler`.
- Default Swagger metadata on every controller method (`@Tag`, `@Operation`). Existing controllers all do this.
- Default to PostgreSQL + Liquibase for any new persistence; do not introduce Flyway, raw SQL bootstrap, or a second datasource.
- Sibling services consume user data by UUID and keep their own thin user projection. When emitting new domain events, treat downstream services (`answer_service`, `course_service`, `learning_service`) as event consumers — keep the payload stable and minimal.
