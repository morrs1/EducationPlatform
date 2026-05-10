<h2 align="center">API Gateway</h2>

*Spring Boot API Gateway for the Education Platform — single public entry point that authenticates users, authorizes role- and ownership-based access, and reverse-proxies traffic to the downstream Spring Boot services.*

---

## Overview

The gateway terminates external HTTP traffic on a single port and exposes:

- Authentication endpoints (`/auth/register`, `/auth/login`) that delegate to `user_service` and issue a gateway JWT.
- A protected proxy (`/api/**`) that validates the JWT, applies the authorization policy, and forwards to one of three downstream services.

It is stateless: no database, no message broker, no cache. The only outbound calls are to `user_service` (for register and login) and to `course_service` (for course/lesson ownership lookups during authorization).

### Request flow

```
HTTP client
    │
    ▼  Bearer JWT
ProxyController (/api/**)
    │
    ├──> JwtTokenService.parseBearerToken   (skipped for public reads)
    │
    ├──> AuthorizationPolicy.authorize
    │        │
    │        └──> CourseServiceOwnershipClient ──> course_service (course/lesson ownership)
    │
    └──> ProxyForwardService.forward ──> downstream service (user/course/learning)
```

---

## Responsibilities

### Authentication (`auth/`)

- `AuthController` exposes `POST /auth/register` and `POST /auth/login`. Both endpoints are public.
- `UserServiceAuthClient` calls `user_service` at `/user/auth/register` and `/user/auth/login`.
- `JwtTokenService` issues HS256 JWTs with claims `sub`, `email`, `role`, `userStatus`, `iat`, `exp`. The same service also parses incoming bearer tokens for the proxy. JWT secret and TTL come from `auth.jwt.secret` and `auth.jwt.ttl`.
- `AuthExceptionHandler` propagates downstream `4xx`/`5xx` responses from `user_service` to the caller, preserving status and content type.

### Authorization (`authz/`)

- `AuthorizationPolicy` enforces role-based and ownership-based rules on every proxied request. `UserRole` is one of `USER`, `AUTHOR`, `ADMIN`.
- Admins bypass all checks.
- Only `ADMIN` can `PATCH /api/user/{id}/assign_(author|admin)`.
- Author drafts (`GET /api/course/by-author/{authorId}/drafts`) are readable only by the author with the matching id, or by admin.
- Course write paths (`POST /api/course`, `PATCH /api/course/{id}/publish`, `POST /api/course/{id}/module`, `POST /api/course/lesson`, `PATCH/POST /api/course/lesson/{id}[/asset]`) require `AUTHOR` role and verified ownership of the target course or lesson.
- Ownership lookups go through `CourseOwnershipVerifier`, implemented by `CourseServiceOwnershipClient`, which queries `course_service` for the course's `authorId` and resolves lesson ownership via the lesson's `courseId`.
- Authorization failures throw `AuthorizationDeniedException`, handled by `AuthorizationExceptionHandler`.

### Proxy (`gateway/`)

- `ProxyController` is the single proxy entry point under the configurable prefix `gateway.proxy.entry-path-prefix` (default `/api`). It accepts any HTTP method.
- `RouteResolver` picks the matching route from `gateway.routes` using the longest `path-prefix` first.
- `ProxyForwardService` forwards the request using the shared `RestClient`, propagates the upstream status, headers, and body, and returns `502 Bad Gateway` when the upstream is unreachable.
- `HopByHopHeaders` strips RFC 7230 hop-by-hop headers (plus `Host`) both inbound and outbound.
- A small whitelist of public reads is allowed without a JWT: `GET /api/course`, `GET /api/course/search`, `GET /api/course/{id}`, `GET /api/course/by-author/{authorId}/published`. Any path containing `/drafts` is excluded from the whitelist.

---

## Tech Stack

| Tool                                | Role                                       |
|-------------------------------------|--------------------------------------------|
| **Java 25**                         | Language / toolchain                       |
| **Spring Boot 4.0.6**               | Application framework                      |
| **spring-boot-starter-webmvc**      | HTTP server (servlet stack)                |
| **spring-boot-starter-restclient**  | Outbound HTTP client for auth and proxy    |
| **springdoc-openapi-starter-webmvc-ui** | OpenAPI 3 + Swagger UI                 |
| **Jackson Databind**                | JSON serialization and JWT payload parsing |
| **Gradle Kotlin DSL**               | Build (`build.gradle.kts`)                 |
| **JUnit 5**                         | Unit tests                                 |
| **spring-boot-starter-webmvc-test** | MVC/web slice tests                        |
| **spring-boot-starter-restclient-test** | RestClient tests                       |

---

## HTTP API

### Auth (handled by the gateway itself)

| Method | Path             | Auth   | Description                                              |
|--------|------------------|--------|----------------------------------------------------------|
| `POST` | `/auth/register` | Public | Proxies to `user_service` register, returns `{ id }`.    |
| `POST` | `/auth/login`    | Public | Authenticates via `user_service`, returns gateway JWT.   |

`POST /auth/login` response:

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "expiresInSeconds": 900,
  "user": {
    "id": "<uuid>",
    "email": "<email>",
    "role": "USER | AUTHOR | ADMIN",
    "userStatus": "<status>"
  }
}
```

### Proxied routes (require `Authorization: Bearer <jwt>` unless listed as public)

| Method        | Path                                        | Notes                                       |
|---------------|---------------------------------------------|---------------------------------------------|
| `*`           | `/api/user/**`                              | Forwards to `user_service` at `:8080`.      |
| `*`           | `/api/course/**`                            | Forwards to `course_service` at `:8081`.    |
| `*`           | `/api/course/lesson/**`                     | Forwards to `course_service` at `:8081`.    |
| `*`           | `/api/learning/**`                          | Forwards to `learning_service` at `:8082`.  |

Public (no JWT required):

| Method | Path                                            |
|--------|-------------------------------------------------|
| `GET`  | `/api/course`                                   |
| `GET`  | `/api/course/{id}`                              |
| `GET`  | `/api/course/search`                            |
| `GET`  | `/api/course/by-author/{authorId}/published`    |

### Documentation

| Method | Path                | Description           |
|--------|---------------------|-----------------------|
| `GET`  | `/v3/api-docs`      | OpenAPI 3 JSON        |
| `GET`  | `/swagger-ui.html`  | Swagger UI            |

---

## Routing Table

Defined in `src/main/resources/application.yaml` under `gateway.routes`. The longest `path-prefix` wins, so `/api/course/lesson` is matched before `/api/course`. The `strip-prefix` value is removed from the request path before forwarding.

| Route id        | Entry path-prefix         | strip-prefix | Target base URI              |
|-----------------|---------------------------|--------------|------------------------------|
| `course-lesson` | `/api/course/lesson`      | `/api`       | `http://localhost:8081`      |
| `course`        | `/api/course`             | `/api`       | `http://localhost:8081`      |
| `learning`      | `/api/learning`           | `/api`       | `http://localhost:8082`      |
| `user`          | `/api/user`               | `/api`       | `http://localhost:8080`      |

Worked examples:

```
GET  http://localhost:8090/api/course/abc           ->  http://localhost:8081/course/abc
GET  http://localhost:8090/api/course/lesson/xyz    ->  http://localhost:8081/course/lesson/xyz
GET  http://localhost:8090/api/learning/progress    ->  http://localhost:8082/learning/progress
POST http://localhost:8090/api/user                 ->  http://localhost:8080/user
```

---

## Configuration / Environment Variables

All settings live in `src/main/resources/application.yaml`. Defaults are dev-friendly; the JWT secret must be overridden in any non-dev environment.

| Variable                 | YAML key                       | Default                                       | Description                                            |
|--------------------------|--------------------------------|-----------------------------------------------|--------------------------------------------------------|
| `SERVER_PORT`            | `server.port`                  | `8090`                                        | Port the gateway listens on.                           |
| `USER_SERVICE_BASE_URI`  | `auth.user-service.base-uri`   | `http://localhost:8080`                       | Base URI used by `UserServiceAuthClient`.              |
| `JWT_SECRET`             | `auth.jwt.secret`              | `dev-secret-change-me-at-least-32-chars`      | HMAC-SHA256 secret for gateway-issued JWTs.            |
| `JWT_TTL`                | `auth.jwt.ttl`                 | `15m`                                         | Token lifetime (ISO-8601 duration).                    |
| —                        | `gateway.proxy.entry-path-prefix` | `/api`                                     | Path prefix that the proxy controller handles.         |
| —                        | `gateway.routes`               | see `application.yaml`                        | Downstream route table.                                |
| —                        | `springdoc.api-docs.path`      | `/v3/api-docs`                                | OpenAPI JSON endpoint.                                 |
| —                        | `springdoc.swagger-ui.path`    | `/swagger-ui.html`                            | Swagger UI endpoint.                                   |

---

## Quick Start

### Prerequisites

- JDK 25 (Gradle's toolchain will fetch it if unavailable, depending on your Gradle setup)
- Running downstream services if you intend to exercise proxied routes:
  - `user_service` on `:8080`
  - `course_service` on `:8081`
  - `learning_service` on `:8082`

### Run

```sh
# from api_gateway/
./gradlew bootRun
```

The gateway listens on `http://localhost:8090`. Swagger UI is at `http://localhost:8090/swagger-ui.html`.

### Build

```sh
./gradlew build
```

Produces an executable jar under `build/libs/`.

### Test

```sh
./gradlew test
```

JUnit 5 suites:

- `org.example.api_gateway_authz_service.ApiGatewayApplicationTests`
- `org.example.api_gateway_authz_service.auth.JwtTokenServiceTest`
- `org.example.api_gateway_authz_service.authz.AuthorizationPolicyTest`
- `org.example.api_gateway_authz_service.gateway.web.ProxyControllerTest`

---

## Project Structure

```
api_gateway/
├── build.gradle.kts
├── settings.gradle.kts
├── gradlew, gradlew.bat, gradle/
└── src/
    ├── main/
    │   ├── java/org/example/api_gateway_authz_service/
    │   │   ├── ApiGatewayApplication.java
    │   │   ├── auth/
    │   │   │   ├── AuthController.java
    │   │   │   ├── AuthExceptionHandler.java
    │   │   │   ├── AuthenticatedUser.java
    │   │   │   ├── JwtAuthenticationException.java
    │   │   │   ├── JwtProperties.java
    │   │   │   ├── JwtTokenService.java
    │   │   │   ├── UserServiceAuthProperties.java
    │   │   │   ├── client/
    │   │   │   │   ├── UserServiceAuthClient.java
    │   │   │   │   ├── UserServiceLoginRequest.java
    │   │   │   │   ├── UserServiceRegisterRequest.java
    │   │   │   │   └── UserServiceRegisterResponse.java
    │   │   │   └── dto/
    │   │   │       ├── LoginRequest.java
    │   │   │       ├── LoginResponse.java
    │   │   │       ├── RegisterRequest.java
    │   │   │       └── RegisterResponse.java
    │   │   ├── authz/
    │   │   │   ├── AuthenticatedPrincipal.java
    │   │   │   ├── AuthorizationDeniedException.java
    │   │   │   ├── AuthorizationExceptionHandler.java
    │   │   │   ├── AuthorizationPolicy.java
    │   │   │   ├── CourseOwnershipVerifier.java
    │   │   │   ├── CourseServiceOwnershipClient.java
    │   │   │   └── UserRole.java
    │   │   ├── gateway/
    │   │   │   ├── config/
    │   │   │   │   ├── GatewayClientConfig.java
    │   │   │   │   └── GatewayProperties.java
    │   │   │   ├── proxy/
    │   │   │   │   ├── HopByHopHeaders.java
    │   │   │   │   └── ProxyForwardService.java
    │   │   │   ├── routing/
    │   │   │   │   ├── MatchedRoute.java
    │   │   │   │   └── RouteResolver.java
    │   │   │   └── web/
    │   │   │       └── ProxyController.java
    │   │   └── setup/config_beans/openapi/
    │   │       └── OpenApiConfig.java
    │   └── resources/
    │       └── application.yaml
    └── test/
        └── java/org/example/api_gateway_authz_service/
            ├── ApiGatewayApplicationTests.java
            ├── auth/JwtTokenServiceTest.java
            ├── authz/AuthorizationPolicyTest.java
            └── gateway/web/ProxyControllerTest.java
```

---

## Sibling Services

The gateway only fronts traffic; the actual platform features live in sibling modules of this monorepo:

| Directory          | Tech                           | Role                                           |
|--------------------|--------------------------------|------------------------------------------------|
| `user_service/`    | Spring Boot (Java)             | Users, registration, login (auth source)       |
| `course_service/`  | Spring Boot (Java)             | Courses, modules, lessons (ownership source)   |
| `learning_service/`| Spring Boot (Java)             | Learning progress                              |
| `answer_service/`  | Python FastAPI (RAG)           | LLM-backed question answering                  |
| `frontend/`        | React 19 + Vite                | Web client                                     |
