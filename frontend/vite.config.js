import process from "node:process";
import { Buffer } from "node:buffer";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const USER_SERVICE_API_PROXY_PATH = "/api/user-service";
const USER_SERVICE_MEDIA_PROXY_PATH = "/api/user-service-media";
const COURSE_SERVICE_API_PROXY_PATH = "/api/course-service";

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

function setHeaderIfPresent(response, headerName, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  response.setHeader(headerName, String(value));
}

function createUserServiceMediaProxyPlugin(env) {
  const s3Client = createS3MediaClient(env);

  if (!s3Client) {
    return {
      name: "user-service-media-proxy",
    };
  }

  const attachProxy = (middlewares) => {
    middlewares.use(async (request, response, next) => {
      const mediaPath = parseMediaRequestPath(request.url);

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
          new GetObjectCommand({
            Bucket: mediaPath.bucket,
            Key: mediaPath.key,
          }),
        );

        response.statusCode = 200;
        setHeaderIfPresent(response, "Content-Type", objectResponse.ContentType);
        setHeaderIfPresent(
          response,
          "Content-Length",
          objectResponse.ContentLength,
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
          error?.$metadata?.httpStatusCode === 404 ? 404 : 502;

        response.statusCode = statusCode;
        response.end(
          statusCode === 404
            ? "S3 object not found."
            : "Unable to load image from S3.",
        );
      }
    });
  };

  return {
    name: "user-service-media-proxy",
    configureServer(server) {
      attachProxy(server.middlewares);
    },
    configurePreviewServer(server) {
      attachProxy(server.middlewares);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const userServiceUrl = env.VITE_USER_SERVICE_URL?.trim();
  const courseServiceUrl = env.VITE_COURSE_SERVICE_URL?.trim();
  const proxy = {};

  if (userServiceUrl) {
    proxy[USER_SERVICE_API_PROXY_PATH] = {
      target: userServiceUrl,
      changeOrigin: true,
      rewrite: (path) =>
        path.replace(/^\/api\/user-service/, ""),
    };
  }

  if (courseServiceUrl) {
    proxy[COURSE_SERVICE_API_PROXY_PATH] = {
      target: courseServiceUrl,
      changeOrigin: true,
      rewrite: (path) =>
        path.replace(/^\/api\/course-service/, ""),
    };
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      createUserServiceMediaProxyPlugin(env),
    ],
    server: Object.keys(proxy).length
      ? {
          proxy,
        }
      : undefined,
  };
});
