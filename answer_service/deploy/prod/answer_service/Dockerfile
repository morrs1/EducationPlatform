FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

WORKDIR /app

ARG APP_VERSION=0.0.0

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    SETUPTOOLS_SCM_PRETEND_VERSION=${APP_VERSION} \
    HATCH_BUILD_HOOKS_ENABLE=false

COPY ./pyproject.toml ./uv.lock ./alembic.ini ./README.md ./LICENSE \
     ./deploy/prod/answer_service/api_entrypoint.sh \
     ./deploy/prod/answer_service/broker_entrypoint.sh \
     ./deploy/prod/answer_service/worker_entrypoint.sh \
     ./deploy/prod/answer_service/scheduler_entrypoint.sh \
     ./

RUN chmod +x ./api_entrypoint.sh ./broker_entrypoint.sh ./worker_entrypoint.sh ./scheduler_entrypoint.sh

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-install-project

COPY ./src ./src

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev


FROM python:3.12-slim-bookworm AS final

WORKDIR /app

ARG APP_UID=10001
ARG APP_GID=10001

ENV VIRTUAL_ENV="/app/.venv" \
    PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -g ${APP_GID} appgroup && \
    useradd -u ${APP_UID} -g ${APP_GID} -s /usr/sbin/nologin -M appuser

COPY --from=builder --chown=${APP_UID}:${APP_GID} /app/ ./

USER appuser
