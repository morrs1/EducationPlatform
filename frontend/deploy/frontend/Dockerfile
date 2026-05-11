# syntax=docker/dockerfile:1.7
# Build: docker build -f deploy/frontend/Dockerfile -t frontend:latest .

ARG NODE_IMAGE=node:22-alpine
ARG NGINX_IMAGE=nginx:1.27-alpine

FROM ${NODE_IMAGE} AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# VITE_* must be present at build time — Vite inlines them into the bundle.
# Defaults map paths to same-origin so nginx can reverse-proxy /api and /auth
# without the bundle hard-coding a hostname.
ARG VITE_API_GATEWAY_URL=/
ARG VITE_AUTH_API_BASE_URL=/auth
ARG VITE_USER_SERVICE_URL=/
ARG VITE_USER_SERVICE_API_BASE_URL=/api/user
ARG VITE_USER_SERVICE_DEMO_USER_ID=
ARG VITE_LEARNING_SERVICE_URL=/
ARG VITE_LEARNING_SERVICE_API_BASE_URL=/api/learning
ARG VITE_COURSE_SERVICE_API_BASE_URL=/api/course
ARG VITE_ANSWER_SERVICE_PROXY_TARGET=
ARG VITE_COURSE_SERVICE_DIRECT_URL=
ARG VITE_USER_SERVICE_DIRECT_URL=

ENV VITE_API_GATEWAY_URL=${VITE_API_GATEWAY_URL} \
    VITE_AUTH_API_BASE_URL=${VITE_AUTH_API_BASE_URL} \
    VITE_USER_SERVICE_URL=${VITE_USER_SERVICE_URL} \
    VITE_USER_SERVICE_API_BASE_URL=${VITE_USER_SERVICE_API_BASE_URL} \
    VITE_USER_SERVICE_DEMO_USER_ID=${VITE_USER_SERVICE_DEMO_USER_ID} \
    VITE_LEARNING_SERVICE_URL=${VITE_LEARNING_SERVICE_URL} \
    VITE_LEARNING_SERVICE_API_BASE_URL=${VITE_LEARNING_SERVICE_API_BASE_URL} \
    VITE_COURSE_SERVICE_API_BASE_URL=${VITE_COURSE_SERVICE_API_BASE_URL} \
    VITE_ANSWER_SERVICE_PROXY_TARGET=${VITE_ANSWER_SERVICE_PROXY_TARGET} \
    VITE_COURSE_SERVICE_DIRECT_URL=${VITE_COURSE_SERVICE_DIRECT_URL} \
    VITE_USER_SERVICE_DIRECT_URL=${VITE_USER_SERVICE_DIRECT_URL}

RUN npm run build

FROM ${NGINX_IMAGE} AS runtime

# nginx 1.25+ runs `envsubst` on every *.template in /etc/nginx/templates
# at container start. We use that to swap in FRONTEND_* env vars at runtime
# without rebuilding the image.
COPY deploy/frontend/nginx.conf.template /etc/nginx/templates/default.conf.template

COPY --from=builder /app/dist /usr/share/nginx/html

ENV FRONTEND_SERVER_PORT=80 \
    FRONTEND_GATEWAY_HOST=api-gateway-app \
    FRONTEND_GATEWAY_PORT=8090 \
    FRONTEND_USER_SERVICE_HOST=user-service-app \
    FRONTEND_USER_SERVICE_PORT=8080 \
    FRONTEND_USER_SERVICE_S3_HOST=user-service-seaweedfs \
    FRONTEND_USER_SERVICE_S3_FILER_PORT=8888 \
    FRONTEND_COURSE_SERVICE_HOST=course-service-app \
    FRONTEND_COURSE_SERVICE_PORT=8081 \
    FRONTEND_COURSE_SERVICE_S3_HOST=user-service-seaweedfs \
    FRONTEND_COURSE_SERVICE_S3_FILER_PORT=8888 \
    FRONTEND_COURSE_SERVICE_S3_BUCKET=course-service-local \
    NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --spider --tries=1 "http://localhost:${FRONTEND_SERVER_PORT}/" || exit 1
