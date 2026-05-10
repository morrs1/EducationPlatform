import process from "node:process";
import http from "node:http";
import { Buffer } from "node:buffer";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const USER_SERVICE_API_PROXY_PATH = "/api/user";
const USER_SERVICE_MEDIA_PROXY_PATH = "/api/user-service-media";
const COURSE_SERVICE_API_PROXY_PATH = "/api/course";
const COURSE_SERVICE_MEDIA_PROXY_PATH = "/api/course-service-media";
const LEARNING_SERVICE_API_PROXY_PATH = "/api/learning";
const ANSWER_SERVICE_API_PROXY_PATH = "/api/answer";
const AUTH_API_PROXY_PATH = "/auth";
const DEFAULT_COURSE_SERVICE_S3_BUCKET = "course-service-local";

function normalizeBoolean(value, fallback = false) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  return fallback;
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function createS3MediaClient(env) {
  const endpoint = env.USER_SERVICE_S3_ENDPOINT?.trim();
  const region = env.USER_SERVICE_S3_REGION?.trim() || "us-east-1";
  const accessKeyId = env.USER_SERVICE_S3_ACCESS_KEY?.trim();
  const secretAccessKey = env.USER_SERVICE_S3_SECRET_KEY?.trim();

  if (!hasText(endpoint) || !hasText(accessKeyId) || !hasText(secretAccessKey)) {
    return null;
  }

  return new S3Client({
    endpoint,
    region,
    forcePathStyle: normalizeBoolean(
      env.USER_SERVICE_S3_FORCE_PATH_STYLE,
      true,
    ),
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function parseMediaRequestPath(url) {
  if (typeof url !== "string" || !url.startsWith(USER_SERVICE_MEDIA_PROXY_PATH)) {
    return null;
  }

  const requestUrl = new URL(url, "http://localhost");
  const pathname = requestUrl.pathname.slice(USER_SERVICE_MEDIA_PROXY_PATH.length);
  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments.length < 2) {
    return null;
  }

  const [bucket, ...keySegments] = pathSegments;

  return {
    bucket,
    key: decodeURIComponent(keySegments.join("/")),
  };
}

function parseCourseServiceMediaRequestPath(url) {
  if (
    typeof url !== "string" ||
    !url.startsWith(COURSE_SERVICE_MEDIA_PROXY_PATH)
  ) {
    return null;
  }

  const requestUrl = new URL(url, "http://localhost");
  const pathname = requestUrl.pathname.slice(COURSE_SERVICE_MEDIA_PROXY_PATH.length);
  const keySegments = pathname.split("/").filter(Boolean);

  if (!keySegments.length) {
    return null;
  }

  return {
    key: decodeURIComponent(keySegments.join("/")),
  };
}

function getCourseServiceMediaBucket(env) {
  const configuredBucket = env.COURSE_SERVICE_S3_BUCKET?.trim();

  return hasText(configuredBucket)
    ? configuredBucket
    : DEFAULT_COURSE_SERVICE_S3_BUCKET;
}

function setHeaderIfPresent(response, headerName, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  response.setHeader(headerName, String(value));
}

function buildGetObjectInput(mediaPath, request) {
  const input = {
    Bucket: mediaPath.bucket,
    Key: mediaPath.key,
  };

  const rangeHeader =
    typeof request.headers.range === "string"
      ? request.headers.range.trim()
      : "";

  if (rangeHeader) {
    input.Range = rangeHeader;
  }

  return input;
}

function createS3MediaProxyPlugin(env) {
  const s3Client = createS3MediaClient(env);
  const courseServiceBucket = getCourseServiceMediaBucket(env);

  if (!s3Client) {
    return {
      name: "s3-media-proxy",
    };
  }

  const attachProxy = (middlewares) => {
    middlewares.use(async (request, response, next) => {
      const userServiceMediaPath = parseMediaRequestPath(request.url);
      const courseServiceMediaPath =
        parseCourseServiceMediaRequestPath(request.url);

      const mediaPath = userServiceMediaPath
        ? userServiceMediaPath
        : courseServiceMediaPath
          ? {
              bucket: courseServiceBucket,
              key: courseServiceMediaPath.key,
            }
          : null;

      if (!mediaPath) {
        return next();
      }

      if (request.method !== "GET" && request.method !== "HEAD") {
        response.statusCode = 405;
        response.end("Method Not Allowed");
        return;
      }

      try {
        const objectResponse = await s3Client.send(
          new GetObjectCommand(buildGetObjectInput(mediaPath, request)),
        );

        response.statusCode =
          objectResponse.ContentRange ||
          objectResponse.$metadata?.httpStatusCode === 206
            ? 206
            : 200;
        setHeaderIfPresent(response, "Content-Type", objectResponse.ContentType);
        setHeaderIfPresent(
          response,
          "Content-Length",
          objectResponse.ContentLength,
        );
        setHeaderIfPresent(
          response,
          "Accept-Ranges",
          objectResponse.AcceptRanges || "bytes",
        );
        setHeaderIfPresent(
          response,
          "Content-Range",
          objectResponse.ContentRange,
        );
        setHeaderIfPresent(response, "ETag", objectResponse.ETag);
        setHeaderIfPresent(
          response,
          "Last-Modified",
          objectResponse.LastModified?.toUTCString?.(),
        );
        setHeaderIfPresent(
          response,
          "Cache-Control",
          objectResponse.CacheControl || "public, max-age=300",
        );
        setHeaderIfPresent(
          response,
          "Content-Disposition",
          objectResponse.ContentDisposition,
        );

        if (request.method === "HEAD") {
          response.end();
          return;
        }

        const body = objectResponse.Body;

        if (!body) {
          response.end();
          return;
        }

        if (typeof body.transformToByteArray === "function") {
          const bytes = await body.transformToByteArray();
          response.end(Buffer.from(bytes));
          return;
        }

        if (typeof body.pipe === "function") {
          body.pipe(response);
          return;
        }

        response.end();
      } catch (error) {
        const statusCode =
          error?.$metadata?.httpStatusCode === 404
            ? 404
            : error?.$metadata?.httpStatusCode === 416
              ? 416
              : 502;

        response.statusCode = statusCode;
        response.end(
          statusCode === 404
            ? "S3 object not found."
            : statusCode === 416
              ? "Requested media range is not satisfiable."
            : "Unable to load image from S3.",
        );
      }
    });
  };

  return {
    name: "s3-media-proxy",
    configureServer(server) {
      attachProxy(server.middlewares);
    },
    configurePreviewServer(server) {
      attachProxy(server.middlewares);
    },
  };
}

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

  // API идёт в gateway (8090). Media остаётся мимо gateway (плагин).
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
      createCourseLessonAssetDevProxyPlugin(env),
      react(),
      tailwindcss(),
      createS3MediaProxyPlugin(env),
    ],
    server: Object.keys(proxy).length
      ? {
          proxy,
        }
      : undefined,
  };
});
