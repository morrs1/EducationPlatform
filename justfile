set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]
set shell := ["sh", "-c"]

compose_file := "docker-compose.yaml"
env_file := ".env"

[doc("List all targets")]
default:
  @just --list --unsorted --list-heading $'EducationPlatform commands…\n'

# ─── Full stack ──────────────────────────────────────────────────────────────

[doc("Build every service image")]
[group("stack")]
build:
  docker compose -f {{compose_file}} --env-file {{env_file}} build

[doc("Start the full stack (postgres + liquibase + seaweedfs + apps + gateway + frontend)")]
[group("stack")]
up:
  docker compose -f {{compose_file}} --env-file {{env_file}} up -d

[doc("Build then start the full stack")]
[group("stack")]
up-build:
  docker compose -f {{compose_file}} --env-file {{env_file}} up -d --build

[doc("Stop the stack but keep volumes")]
[group("stack")]
down:
  docker compose -f {{compose_file}} --env-file {{env_file}} down

[doc("Stop the stack and drop volumes (DESTROYS database + S3 data)")]
[group("stack")]
down-volumes:
  docker compose -f {{compose_file}} --env-file {{env_file}} down -v

[doc("List running services")]
[group("stack")]
ps:
  docker compose -f {{compose_file}} --env-file {{env_file}} ps

[doc("Tail logs from every service")]
[group("stack")]
logs:
  docker compose -f {{compose_file}} --env-file {{env_file}} logs -f

[doc("Tail logs from a single service (just logs-one user_service.app)")]
[group("stack")]
logs-one service:
  docker compose -f {{compose_file}} --env-file {{env_file}} logs -f {{service}}

[doc("Restart a single service (just restart user_service.app)")]
[group("stack")]
restart service:
  docker compose -f {{compose_file}} --env-file {{env_file}} restart {{service}}

[doc("Rebuild and recreate a single service (just redeploy api_gateway.app)")]
[group("stack")]
redeploy service:
  docker compose -f {{compose_file}} --env-file {{env_file}} up -d --build {{service}}

# ─── Per-service shortcuts ───────────────────────────────────────────────────
# Each sub-service has its own justfile under <service>/justfile with the
# same docker / gradle / lint targets. Use those when you want to iterate on
# one service without spinning up the whole stack.

[doc("Open a shell on a running service (just shell user_service.app)")]
[group("stack")]
shell service:
  docker compose -f {{compose_file}} --env-file {{env_file}} exec {{service}} sh
