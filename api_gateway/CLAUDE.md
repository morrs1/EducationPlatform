# CLAUDE.md — api_gateway

This file is for **Claude Code** and any AI assistant compatible with `CLAUDE.md` discovery. It applies to everything under `api_gateway/`. The repo-root `CLAUDE.md` and the local `AGENTS.md` still apply; this file does not duplicate them, it points at them and adds Claude-actionable rules.

## Project intent

`api_gateway` is the single public entry point for the EducationPlatform backend. It terminates external HTTP on port `8090`, owns the `/auth/login` and `/auth/register` endpoints (delegating to `user_service` and issuing a gateway HS256 JWT), and reverse-proxies authenticated traffic under `/api/{course,learning,user}/**` to the downstream Spring Boot services. It is stateless — no DB, no broker, no cache. Authorization (role + course/lesson ownership) is enforced centrally so downstream services can trust the authenticated principal.

## Read first

In this order. Do not re-derive what these files already say.

1. `api_gateway/AGENTS.md` — authoritative architecture, layer boundaries, validation bar.
2. `api_gateway/README.md` — HTTP API, routing table, configuration, project structure.
3. `/CLAUDE.md` (repo root) — non-negotiable cross-service rules.
4. `/.cursor/rules/clean-architecture.mdc` — layer dependency direction.
5. `/.cursor/rules/ddd.mdc` — aggregates, value objects, ports.
6. `/.cursor/rules/tdd.mdc` — test-first expectations.

## Architecture map

Base package: `org.example.api_gateway_authz_service`. Three responsibilities, three packages.

| Package                     | Owns                                                                                  | Key types                                                                                                                  |
|-----------------------------|---------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `auth/`                     | Public `/auth/**` endpoints, JWT issuing, single auth client to `user_service`.       | `AuthController`, `UserServiceAuthClient`, `JwtTokenService`, `JwtProperties`, `AuthExceptionHandler`, `AuthenticatedUser` |
| `auth/dto/`                 | Public request/response DTOs exposed on `/auth/**`.                                   | `LoginRequest`, `LoginResponse`, `RegisterRequest`, `RegisterResponse`                                                     |
| `auth/client/`              | Wire DTOs for `user_service`. Internal — never returned from `/auth/**`.              | `UserServiceLoginRequest`, `UserServiceRegisterRequest`, `UserServiceRegisterResponse`                                     |
| `authz/`                    | Role + ownership policy enforced on every proxied request.                            | `AuthorizationPolicy`, `AuthenticatedPrincipal`, `UserRole`, `CourseOwnershipVerifier`, `CourseServiceOwnershipClient`     |
| `gateway/config/`           | Shared `RestClient` and `gateway.*` properties binding.                               | `GatewayClientConfig`, `GatewayProperties`                                                                                 |
| `gateway/proxy/`            | The single upstream HTTP call and hop-by-hop header handling.                         | `ProxyForwardService`, `HopByHopHeaders`                                                                                   |
| `gateway/routing/`          | Longest-prefix route matching against `gateway.routes` from YAML.                     | `RouteResolver`, `MatchedRoute`                                                                                            |
| `gateway/web/`              | The single proxy entry controller. Runs auth, then policy, then forwards.             | `ProxyController`                                                                                                          |
| `setup/config_beans/openapi/` | Springdoc OpenAPI configuration.                                                    | `OpenApiConfig`                                                                                                            |

## Editing rules

These are concrete and prescriptive. Apply them before adding code.

- **New authorization rule.** Extend `AuthorizationPolicy.authorize(...)` and add a unit test in `src/test/java/.../authz/AuthorizationPolicyTest.java`. Do not branch by role inside a controller, a client, or `ProxyForwardService`.
- **New proxy route.** Add it to `src/main/resources/application.yaml` under `gateway.routes`. Do not introduce a new controller, do not hardcode a target URI in Java. More-specific prefixes (e.g. `/api/course/lesson`) need their own entry — `RouteResolver` matches longest prefix.
- **New public anonymous read.** Extend only `ProxyController.isPublicPublishedCourseRead` and its private `Pattern` fields. Never weaken the JWT check globally and never add a parallel whitelist mechanism.
- **JWT secret and TTL.** Read only from `JwtProperties`. Never inline a default in code, never read `auth.jwt.*` directly with `@Value` outside `JwtProperties`.
- **JWT claim shape.** Fixed: `sub`, `email`, `role`, `userStatus`, `iat`, `exp`. If you change them, change `JwtTokenService.createToken`, `JwtTokenService.parseBearerToken`, and `AuthenticatedPrincipal`/`AuthenticatedUser` in the same edit.
- **Auth flow.** Must stay `AuthController` -> `UserServiceAuthClient` -> `JwtTokenService`. Do not add a fourth hop, do not let `AuthController` talk to `JwtTokenService` without going through `UserServiceAuthClient` first on login.
- **Downstream HTTP calls.** All proxied traffic goes through `ProxyForwardService` + `HopByHopHeaders` using the shared `RestClient` from `GatewayClientConfig`. Do not instantiate a second `RestClient`, do not fall back to `RestTemplate`, do not introduce WebClient.
- **Course / lesson ownership.** Go through `CourseOwnershipVerifier`. If you need a new ownership question, add a method to that interface and implement it in `CourseServiceOwnershipClient`. Never call `course_service` from `AuthorizationPolicy` directly.
- **DTO discipline.** `auth/dto/` is the public contract. `auth/client/` is the wire format for `user_service`. Never return a `auth/client/` type from `AuthController`, never accept a `auth/dto/` type into `UserServiceAuthClient`.
- **Configuration properties.** New `@ConfigurationProperties` records must be registered on `ApiGatewayApplication` via `@EnableConfigurationProperties`.
- **Logging.** SLF4J only. No `System.out` / `System.err`.

## Anti-patterns

Do not do any of the following.

- Calling `user_service` for register/login from anywhere other than `UserServiceAuthClient`.
- Adding a second proxy controller, or a second `/api/**` mapping.
- Putting JWT signing or parsing inside `gateway/`. JWT is `auth/`'s problem.
- Putting role checks inside controllers, clients, or `ProxyForwardService`. They belong in `AuthorizationPolicy`.
- Adding a new downstream service by writing a controller for it. Add a `gateway.routes` entry instead.
- Hardcoding `Authorization`, `Host`, or other hop-by-hop headers anywhere except `HopByHopHeaders`.
- Introducing per-request DB calls, caches, or stateful sessions. The gateway is stateless by design.
- Bringing in an external JWT library when `JwtTokenService` already implements HS256.

## Validation

Run from `api_gateway/`. The Gradle wrapper is committed.

```sh
./gradlew build     # compile + test + assemble
./gradlew check     # build + all verification tasks
./gradlew test      # JUnit 5 only
```

After touching `AuthorizationPolicy`, `JwtTokenService`, `ProxyController`, `RouteResolver`, `GatewayProperties`, or `application.yaml`: always run `./gradlew test`. Pure documentation or comment changes need no Gradle run.
