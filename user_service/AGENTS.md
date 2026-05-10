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

## Validation

There is no separate `just`/`make` runner — everything goes through the Gradle wrapper from the `user_service/` directory:

```sh
./gradlew bootRun          # run the service locally on port 8080
./gradlew build            # full build (compile + test)
./gradlew test             # JUnit 5 tests only
```

Existing tests cover `application/interactors/user/{create_user, assign_role, authenticate_user}`. If you touch any of these interactors, run `./gradlew test` and update or add tests in `src/test/java/.../application/interactors/user/<operation>/`.

For schema changes:

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
