import process from "node:process";
import http from "node:http";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const USER_SERVICE_API_PROXY_PATH = "/api/user";
const COURSE_SERVICE_API_PROXY_PATH = "/api/course";
const LEARNING_SERVICE_API_PROXY_PATH = "/api/learning";
const ANSWER_SERVICE_API_PROXY_PATH = "/api/answer";
const AUTH_API_PROXY_PATH = "/auth";
const USER_SERVICE_MEDIA_PROXY_PATH = "/api/user-service-media";
const COURSE_SERVICE_MEDIA_PROXY_PATH = "/api/course-service-media";

const HOP_BY_HOP_REQUEST_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

/**
 * В dev multipart через API gateway ломает profile photo (и раньше — course asset).
 * POST /api/user/add_photo уходит напрямую на user_service (pipe), минуя gateway.
 * @see VITE_USER_SERVICE_DIRECT_URL
 */
function createUserProfilePhotoUploadDevProxyPlugin(env) {
  const targetBase =
    env.VITE_USER_SERVICE_DIRECT_URL?.trim() || "http://localhost:8080";
  const uploadPath = /^\/api\/user\/add_photo\/?(?:\?.*)?$/;

  return {
    name: "user-profile-photo-upload-direct-dev",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "POST" || typeof req.url !== "string") {
          next();
          return;
        }
        if (!uploadPath.test(req.url)) {
          next();
          return;
        }

        let upstream;
        try {
          upstream = new URL(
            req.url.replace(/^\/api\/user/, "/user"),
            targetBase.endsWith("/") ? targetBase : `${targetBase}/`,
          );
        } catch {
          next();
          return;
        }

        const outgoingHeaders = { ...req.headers };
        for (const name of Object.keys(outgoingHeaders)) {
          if (name && HOP_BY_HOP_REQUEST_HEADERS.has(name.toLowerCase())) {
            delete outgoingHeaders[name];
          }
        }
        outgoingHeaders.host = upstream.host;

        const proxyReq = http.request(
          {
            hostname: upstream.hostname,
            port:
              upstream.port ||
              (upstream.protocol === "https:" ? 443 : 80),
            path: `${upstream.pathname}${upstream.search}`,
            method: "POST",
            headers: outgoingHeaders,
          },
          (proxyRes) => {
            res.writeHead(
              proxyRes.statusCode ?? 502,
              proxyRes.headers,
            );
            proxyRes.pipe(res);
          },
        );

        proxyReq.on("error", () => {
          if (!res.headersSent) {
            res.statusCode = 502;
            res.end("Bad gateway (user-service add_photo proxy)");
          }
        });

        req.pipe(proxyReq);
      });
    },
  };
}

/**
 * Public author names use the old direct user_service read path. Gateway keeps
 * /api/user/** protected, so only this same-origin read bypasses it in dev.
 */
function createUserPublicDisplayDevProxyPlugin(env) {
  const targetBase =
    env.VITE_USER_SERVICE_DIRECT_URL?.trim() || "http://localhost:8080";
  const publicDisplayPath = /^\/api\/user-service\/user\/?(?:\?.*)?$/;

  return {
    name: "user-public-display-direct-dev",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "GET" || typeof req.url !== "string") {
          next();
          return;
        }
        if (!publicDisplayPath.test(req.url)) {
          next();
          return;
        }

        let upstream;
        try {
          upstream = new URL(
            req.url.replace(/^\/api\/user-service/, ""),
            targetBase.endsWith("/") ? targetBase : `${targetBase}/`,
          );
        } catch {
          next();
          return;
        }

        const outgoingHeaders = { ...req.headers };
        for (const name of Object.keys(outgoingHeaders)) {
          if (name && HOP_BY_HOP_REQUEST_HEADERS.has(name.toLowerCase())) {
            delete outgoingHeaders[name];
          }
        }
        delete outgoingHeaders.authorization;
        outgoingHeaders.host = upstream.host;

        const proxyReq = http.request(
          {
            hostname: upstream.hostname,
            port:
              upstream.port ||
              (upstream.protocol === "https:" ? 443 : 80),
            path: `${upstream.pathname}${upstream.search}`,
            method: "GET",
            headers: outgoingHeaders,
          },
          (proxyRes) => {
            res.writeHead(
              proxyRes.statusCode ?? 502,
              proxyRes.headers,
            );
            proxyRes.pipe(res);
          },
        );

        proxyReq.on("error", () => {
          if (!res.headersSent) {
            res.statusCode = 502;
            res.end("Bad gateway (user-service public display proxy)");
          }
        });

        req.pipe(proxyReq);
      });
    },
  };
}

/**
 * Browser cannot resolve Docker-only SeaweedFS URLs saved by user_service
 * (for example http://user-service-seaweedfs:8333/<bucket>/<key>).
 * GET /api/user-service-media/<bucket>/<key> is proxied to SeaweedFS Filer.
 */
function createUserServiceMediaDevProxyPlugin(env) {
  const targetBase =
    env.VITE_USER_SERVICE_MEDIA_PROXY_TARGET?.trim() || "http://localhost:8888";
  const mediaPath = new RegExp(`^${USER_SERVICE_MEDIA_PROXY_PATH}/(.+)$`);

  return {
    name: "user-service-media-direct-dev",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (typeof req.url !== "string") {
          next();
          return;
        }

        const match = req.url.match(mediaPath);

        if (!match) {
          next();
          return;
        }

        let upstream;
        try {
          upstream = new URL(
            `/buckets/${match[1]}`,
            targetBase.endsWith("/") ? targetBase : `${targetBase}/`,
          );
        } catch {
          next();
          return;
        }

        const outgoingHeaders = { ...req.headers };
        for (const name of Object.keys(outgoingHeaders)) {
          if (name && HOP_BY_HOP_REQUEST_HEADERS.has(name.toLowerCase())) {
            delete outgoingHeaders[name];
          }
        }
        outgoingHeaders.host = upstream.host;

        const proxyReq = http.request(
          {
            hostname: upstream.hostname,
            port:
              upstream.port ||
              (upstream.protocol === "https:" ? 443 : 80),
            path: `${upstream.pathname}${upstream.search}`,
            method: req.method,
            headers: outgoingHeaders,
          },
          (proxyRes) => {
            res.writeHead(
              proxyRes.statusCode ?? 502,
              proxyRes.headers,
            );
            proxyRes.pipe(res);
          },
        );

        proxyReq.on("error", () => {
          if (!res.headersSent) {
            res.statusCode = 502;
            res.end("Bad gateway (user-service media proxy)");
          }
        });

        req.pipe(proxyReq);
      });
    },
  };
}

/**
 * GET /api/course-service-media/<storage-key> is proxied to the course assets
 * bucket in SeaweedFS Filer so uploaded lesson images/videos can be read in dev.
 */
function createCourseServiceMediaDevProxyPlugin(env) {
  const targetBase =
    env.VITE_COURSE_SERVICE_MEDIA_PROXY_TARGET?.trim() ||
    "http://localhost:8888";
  const bucket =
    env.VITE_COURSE_SERVICE_MEDIA_BUCKET?.trim() || "course-service-local";
  const mediaPath = new RegExp(`^${COURSE_SERVICE_MEDIA_PROXY_PATH}/(.+)$`);

  return {
    name: "course-service-media-direct-dev",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (typeof req.url !== "string") {
          next();
          return;
        }

        const match = req.url.match(mediaPath);

        if (!match) {
          next();
          return;
        }

        let upstream;
        try {
          upstream = new URL(
            `/buckets/${bucket}/${match[1]}`,
            targetBase.endsWith("/") ? targetBase : `${targetBase}/`,
          );
        } catch {
          next();
          return;
        }

        const outgoingHeaders = { ...req.headers };
        for (const name of Object.keys(outgoingHeaders)) {
          if (name && HOP_BY_HOP_REQUEST_HEADERS.has(name.toLowerCase())) {
            delete outgoingHeaders[name];
          }
        }
        outgoingHeaders.host = upstream.host;

        const proxyReq = http.request(
          {
            hostname: upstream.hostname,
            port:
              upstream.port ||
              (upstream.protocol === "https:" ? 443 : 80),
            path: `${upstream.pathname}${upstream.search}`,
            method: req.method,
            headers: outgoingHeaders,
          },
          (proxyRes) => {
            res.writeHead(
              proxyRes.statusCode ?? 502,
              proxyRes.headers,
            );
            proxyRes.pipe(res);
          },
        );

        proxyReq.on("error", () => {
          if (!res.headersSent) {
            res.statusCode = 502;
            res.end("Bad gateway (course-service media proxy)");
          }
        });

        req.pipe(proxyReq);
      });
    },
  };
}

/**
 * В dev multipart через API gateway (Spring RestClient + body byte[]) часто даёт 400 на course-service.
 * Обход без правок Java: только POST загрузки ассета урока уходит напрямую на course-service.
 * Задаётся VITE_COURSE_SERVICE_DIRECT_URL (по умолчанию http://localhost:8081).
 */
function createCourseLessonAssetDevProxyPlugin(env) {
  const targetBase =
    env.VITE_COURSE_SERVICE_DIRECT_URL?.trim() || "http://localhost:8081";
  const assetPathPattern =
    /^\/api\/course\/lesson\/[^/]+\/asset\/?(?:\?.*)?$/;

  return {
    name: "course-lesson-asset-direct-dev",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "POST" || typeof req.url !== "string") {
          next();
          return;
        }
        if (!assetPathPattern.test(req.url)) {
          next();
          return;
        }

        let upstream;
        try {
          upstream = new URL(req.url.replace(/^\/api/, ""), targetBase);
        } catch {
          next();
          return;
        }

        const outgoingHeaders = { ...req.headers };
        for (const name of Object.keys(outgoingHeaders)) {
          if (name && HOP_BY_HOP_REQUEST_HEADERS.has(name.toLowerCase())) {
            delete outgoingHeaders[name];
          }
        }
        outgoingHeaders.host = upstream.host;

        const proxyReq = http.request(
          {
            hostname: upstream.hostname,
            port:
              upstream.port ||
              (upstream.protocol === "https:" ? 443 : 80),
            path: `${upstream.pathname}${upstream.search}`,
            method: "POST",
            headers: outgoingHeaders,
          },
          (proxyRes) => {
            res.writeHead(
              proxyRes.statusCode ?? 502,
              proxyRes.headers,
            );
            proxyRes.pipe(res);
          },
        );

        proxyReq.on("error", () => {
          if (!res.headersSent) {
            res.statusCode = 502;
            res.end("Bad gateway (course-service asset proxy)");
          }
        });

        req.pipe(proxyReq);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxy = {};

  const gatewayUrl = env.VITE_API_GATEWAY_URL?.trim() || "http://localhost:8090";
  proxy[USER_SERVICE_API_PROXY_PATH] = {
    target: gatewayUrl,
    changeOrigin: true,
  };
  proxy[COURSE_SERVICE_API_PROXY_PATH] = {
    target: gatewayUrl,
    changeOrigin: true,
  };
  proxy[LEARNING_SERVICE_API_PROXY_PATH] = {
    target: gatewayUrl,
    changeOrigin: true,
  };
  proxy[ANSWER_SERVICE_API_PROXY_PATH] = {
    target:
      env.VITE_ANSWER_SERVICE_PROXY_TARGET?.trim() ||
      "http://localhost:8085",
    changeOrigin: true,
    rewrite: (path) => path.replace(ANSWER_SERVICE_API_PROXY_PATH, ""),
  };
  proxy[AUTH_API_PROXY_PATH] = {
    target: gatewayUrl,
    changeOrigin: true,
  };

  return {
    plugins: [
      createUserServiceMediaDevProxyPlugin(env),
      createCourseServiceMediaDevProxyPlugin(env),
      createUserPublicDisplayDevProxyPlugin(env),
      createUserProfilePhotoUploadDevProxyPlugin(env),
      createCourseLessonAssetDevProxyPlugin(env),
      react(),
      tailwindcss(),
    ],
    server: Object.keys(proxy).length
      ? {
          proxy,
        }
      : undefined,
  };
});
