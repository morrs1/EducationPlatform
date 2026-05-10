# CLAUDE.md — user_service

This file is the Claude-specific complement to `user_service/AGENTS.md`. `AGENTS.md` is the contract; this file is the operating manual. If they ever disagree, fix both.

## Read first

Before editing anything under `user_service/`, open these in order:

1. `user_service/AGENTS.md` — layer boundaries, ports, where to add code.
2. `user_service/README.md` — HTTP API, env vars, quick start.
3. Repo root `CLAUDE.md` — non-negotiable monorepo rules.
4. `.cursor/rules/clean-architecture.mdc` — dependency direction, ports & adapters.
5. `.cursor/rules/ddd.mdc` — aggregates, value objects, domain events.
6. `.cursor/rules/tdd.mdc` — interactor test conventions.

## Project intent

`user_service` is the source of truth for user identity in the EducationPlatform monorepo. It owns registration, BCrypt-based credential verification, profile data, role assignment (`USER` / `AUTHOR` / `ADMIN`), and profile photo storage on a SeaweedFS-compatible S3 bucket. It does not issue or validate JWTs — `api_gateway` does that on top of `POST /user/auth/login`.

## Architecture map

```
src/main/java/org/example/user_service/
  domain/                       Pure Java. No Spring, JPA, AWS, or Jackson.
    base/                       BaseEntity, BaseValueObject, BaseDomainEvent,
                                BaseDomainService, base/exceptions/
    user/
      User.java                 Aggregate root.
      events/                   CreateUserDomainEvent, ...
      ports/PasswordHasher      Domain-owned port. Only port not in application/.
      services/UserDomainService State mutation + domain event recording.
      vo/                       UserId, UserEmail, UserName, UserSurname,
                                UserPatronymic, UserStatus, UserPassword,
                                UserProfilePhotoLink, UserRole. Self-validating.
  application/
    exceptions/                 UserNotFoundException, UserAlreadyExistsException,
                                InvalidCredentialsException.
    ports/                      UserRepo, PhotoStorage, EventBus,
                                TransactionManager.
    interactors/
      mappers/UserViewMapper    Domain User -> view records.
      user/<operation>/         One folder per use case. Each folder owns its
                                Command, Interactor, and (optional) View.
  infrastructure/
    adapters/persistence/       HibernateUserRepo (UserRepo adapter).
    adapters/password_hasher/   PasswordHasherBcrypt. Only place BCrypt lives.
    adapters/s3/                SeaweedFSUserProfilePhotoRepo. Only place the
                                AWS SDK lives.
    adapters/event_bus/         SpringEventBus (ApplicationEventPublisher).
    adapters/transactions/      SpringTransactionManagerAdapter.
    event_handlers/             UserEventHandler (@EventListener).
    persistence/models/         HibernateUser (JPA entity, table `users`).
    persistence/mappers/        UserMapperHibernate (MapStruct).
  presentation/http/v1/
    user/create/{dto,handlers}/         POST /user, CreateHandler.
    user/auth/{dto,handlers}/           POST /user/auth/{register,login},
                                        UserAuthHandler.
    user/read_by_id/{dto,handlers}/     GET /user, ReadByIdHandler.
    user/update_user/{dto,...}/         PATCH /user/{id}/change_*,
                                        UpdateUserHandler.
    user/assign_role/                   PATCH /user/{id}/assign_*,
                                        AssignUserRoleHandler.
    user/add_profile_photo/             POST /user/add_photo,
                                        AddProfilePhotoHandler.
    mappers/                    UserMapperCommand, UserMapperQuery (MapStruct).
    exceptionHandlers/          ApiExceptionHandler, ErrorResponse.
    exception/                  EmptyFileException.
  setup/config_beans/
    user/UserBeansConfig        Wires interactors as @Bean.
    s3/                         SeaweedFSBeansConfig, SeaweedFSConnectionInfo.
    transaction/                TransactionalBeansConfig.
    openapi/OpenApiConfig
  UserServiceApplication.java   @SpringBootApplication entry point.
```

## Hard rules

These are not suggestions. Reviewers will reject diffs that break them.

- Password hashing is owned by the `PasswordHasher` port. BCrypt lives in `infrastructure/adapters/password_hasher/PasswordHasherBcrypt`. Never call `BCryptPasswordEncoder` directly from `application/`, `presentation/`, or any other adapter.
- S3 access is owned by the `PhotoStorage` port. The S3 adapter (`infrastructure/adapters/s3/SeaweedFSUserProfilePhotoRepo`) is the only file in this service that imports `software.amazon.awssdk`. New blob features extend `PhotoStorage` and the adapter — they do not import the SDK elsewhere.
- Each command has its own folder under `application/interactors/user/<operation>/`. Do not collapse `change_name` / `change_surname` / `change_patronymic` / `change_status` into one updater. New work on profile updates must split, not merge.
- State mutation goes through `UserDomainService`. Interactors never mutate `User` fields directly — they call the domain service so events are recorded.
- Domain events leave the service via the outbox + RabbitMQ when the outbox is wired in. Never publish to RabbitMQ from a domain method. Today the in-process `SpringEventBus` is the only adapter; tomorrow's outbox replaces the adapter, not the call sites.
- `domain/` has zero framework imports. No `org.springframework.*`, no `jakarta.persistence.*`, no `software.amazon.*`, no `com.fasterxml.jackson.*`. The only exception is `spring-security-crypto` consumed via the `PasswordHasher` adapter (in infrastructure).
- Profile photo uploads are multipart, max 10MB, enforced by `spring.servlet.multipart.max-file-size` / `max-request-size` in `application.yaml`. Do not raise the cap inside the controller. Allowed extensions are `jpg`, `jpeg`, `png`, `webp`.
- Role assignment endpoints (`/user/{id}/assign_author`, `/user/{id}/assign_admin`) are admin-only. The gateway is the enforcement point, but the application layer also re-checks. New role-changing use cases must defend the same way — never assume the gateway already filtered.
- DTOs (records under `presentation/http/v1/user/<op>/dto/`) never cross into `application/`. Controllers map DTO -> command via `UserMapperCommand` and view -> response via `UserMapperQuery`.
- Lombok is forbidden on `domain/` types. The aggregate uses explicit getters/setters because the domain service mutates fields; value objects are constructor-validated. Lombok is fine on Spring components, interactors, and JPA entities.
- `MultipartFile` does not leave `presentation/`. The controller pulls bytes (and metadata) out and passes them into a command; the interactor sees `byte[]` + filename + content type, never `MultipartFile`.

## Tests

Layout mirrors `application/`:

```
src/test/java/org/example/user_service/application/interactors/user/<operation>/
  <Operation>InteractorTest.java
```

Existing examples: `create_user/CreateUserInteractorTest.java`, `assign_role/...`, `authenticate_user/...`. Pattern is in-memory fakes of `UserRepo`, `EventBus`, `TransactionManager`, and `PasswordHasher` — no Spring context, no Mockito magic for ports, JUnit 5 only.

If you touch an interactor under `create_user`, `assign_role`, or `authenticate_user`, rerun and update the matching test. New interactors require a new test file in the same path.

## Validation

From `user_service/`:

```sh
./gradlew build            # compile + test
./gradlew check            # full verification (build, test, anything else wired in)
./gradlew test             # JUnit 5 tests only
./gradlew bootRun          # run the service on port 8080
```

`./gradlew build` is the minimum after any edit; `./gradlew check` is the bar before committing.

## Common gotchas

- The S3 config prefix is `temp.s3.*`. Yes, the `temp` is on purpose — it signals "this whole storage layer is provisional and may be replaced before GA". Do not "fix" it to `s3.*` or `seaweedfs.*` without a migration plan.
- The S3 adapter and the `/user/add_photo` endpoint are guarded by `@ConditionalOnBean(SeaweedFSUserProfilePhotoRepo.class)` plus `temp.s3.enabled=true`. The service must boot with `TEMP_S3_ENABLED=false`. New S3-dependent endpoints follow the same conditional pattern.
- SeaweedFS config beans live in `setup/config_beans/s3/` (`SeaweedFSBeansConfig`, `SeaweedFSConnectionInfo`), not under `infrastructure/`. They are Spring wiring, not adapters.
- `User`'s `@ToString` excludes `password`. Do not log the user object via custom `String.format` either — credentials must never appear in logs.
- The current `update_user` package contains a single `ChangePersonalDataUserInteractor` with four methods. New profile-update use cases (any new field) must be added as their own folder per the hard rule above; do not extend that legacy class.
- Spring Boot 4 is on Java 25 — keep records, switch expressions, pattern matching, and sealed types in mind, but do not enable preview features.
- Do not introduce Spring Security HTTP filters here. The only acceptable Spring Security dependency is `spring-security-crypto` for BCrypt.
- Liquibase changelogs live under `deploy/liquibase/changelog/v.<version>/`. Never edit a committed changelog — add a new versioned file and reference it from `db.changelog-master.yaml`.
- Russian strings, log messages, and TODOs already in the codebase are intentional. Preserve them unless the task explicitly says to change them.
