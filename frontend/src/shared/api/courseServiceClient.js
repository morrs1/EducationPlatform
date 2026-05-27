import {
  normalizeArray,
  normalizeText,
  normalizeUuidResponse,
} from "../lib/gatewayValues";
import { createApiError, createNetworkApiError } from "./apiErrors";
import { withGatewayAuth } from "./gatewayFetch";

const DEFAULT_COURSE_SERVICE_API_BASE_URL = "/api/course";

const courseRequestCache = new Map();
const lessonRequestCache = new Map();
const courseListRequestCache = new Map();
const authorCourseListRequestCache = new Map();
const courseSearchRequestCache = new Map();

function readResponseBody(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => "");
}

function getCourseServiceApiBaseUrl() {
  const configuredBaseUrl = normalizeText(
    import.meta.env.VITE_COURSE_SERVICE_API_BASE_URL,
  );

  return configuredBaseUrl || DEFAULT_COURSE_SERVICE_API_BASE_URL;
}

function buildCourseServiceUrl(pathname = "") {
  return new URL(
    `${getCourseServiceApiBaseUrl()}${pathname}`,
    window.location.origin,
  );
}

function invalidateCourseCache(courseId) {
  const normalizedCourseId = normalizeText(courseId);

  if (!normalizedCourseId) {
    return;
  }

  courseRequestCache.delete(
    buildCourseServiceUrl(`/${normalizedCourseId}`).toString(),
  );
}

function invalidateCourseListCache() {
  courseListRequestCache.delete(buildCourseServiceUrl("").toString());
}

function invalidateAuthorCourseListCache(authorId) {
  const normalizedAuthorId = normalizeText(authorId);

  if (!normalizedAuthorId) {
    authorCourseListRequestCache.clear();
    return;
  }

  authorCourseListRequestCache.delete(
    buildCourseServiceUrl(
      `/by-author/${normalizedAuthorId}/published`,
    ).toString(),
  );
  authorCourseListRequestCache.delete(
    buildCourseServiceUrl(
      `/by-author/${normalizedAuthorId}/drafts`,
    ).toString(),
  );
}

function invalidateLessonCache(lessonId) {
  const normalizedLessonId = normalizeText(lessonId);

  if (!normalizedLessonId) {
    return;
  }

  lessonRequestCache.delete(
    buildCourseServiceUrl(`/lesson/${normalizedLessonId}`).toString(),
  );
}

async function requestCourseService(pathname, options = {}) {
  const requestUrl = buildCourseServiceUrl(pathname).toString();
  let response;

  try {
    response = await fetch(requestUrl, withGatewayAuth(options));
  } catch (error) {
    throw createNetworkApiError(error, { context: "запрос к курсам" });
  }

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw createApiError(response, responseBody, {
      context: "запрос к курсам",
    });
  }

  return responseBody;
}

async function requestCourseServiceJson(pathname, requestCache) {
  const requestUrl = buildCourseServiceUrl(pathname).toString();
  const cachedRequest = requestCache.get(requestUrl);

  if (cachedRequest) {
    return cachedRequest;
  }

  const requestPromise = fetch(
    requestUrl,
    withGatewayAuth({
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }),
  )
    .then(async (response) => {
      const responseBody = await readResponseBody(response);

      if (!response.ok) {
        throw createApiError(response, responseBody, {
          context: "загрузка данных курса",
        });
      }

      return responseBody;
    })
    .catch((error) => {
      requestCache.delete(requestUrl);
      if (error?.status != null) {
        throw error;
      }

      throw createNetworkApiError(error, {
        context: "загрузка данных курса",
      });
    });

  requestCache.set(requestUrl, requestPromise);

  return requestPromise;
}

export async function requestCourseById(courseId) {
  return requestCourseServiceJson(`/${courseId}`, courseRequestCache);
}

export async function requestAllCourses() {
  const responseBody = await requestCourseServiceJson(
    "",
    courseListRequestCache,
  );

  return normalizeArray(responseBody);
}

export async function requestSearchCourses(query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return [];
  }

  const responseBody = await requestCourseServiceJson(
    `/search?q=${encodeURIComponent(normalizedQuery)}`,
    courseSearchRequestCache,
  );

  return normalizeArray(responseBody);
}

export async function requestPublishedCoursesByAuthor(authorId) {
  const normalizedAuthorId = normalizeText(authorId);
  const responseBody = await requestCourseServiceJson(
    `/by-author/${normalizedAuthorId}/published`,
    authorCourseListRequestCache,
  );

  return normalizeArray(responseBody);
}

export async function requestDraftCoursesByAuthor(authorId) {
  const normalizedAuthorId = normalizeText(authorId);
  const responseBody = await requestCourseServiceJson(
    `/by-author/${normalizedAuthorId}/drafts`,
    authorCourseListRequestCache,
  );

  return normalizeArray(responseBody);
}

export async function requestLessonById(lessonId) {
  return requestCourseServiceJson(
    `/lesson/${lessonId}`,
    lessonRequestCache,
  );
}

export async function requestCourseCreation(payload) {
  const responseBody = await requestCourseService("", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  invalidateCourseListCache();
  invalidateAuthorCourseListCache(payload?.authorId);

  return normalizeUuidResponse(responseBody);
}

export async function requestAddModuleToCourse(courseId, payload) {
  const normalizedCourseId = normalizeText(courseId);
  const responseBody = await requestCourseService(
    `/${normalizedCourseId}/module`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  invalidateCourseCache(normalizedCourseId);
  invalidateCourseListCache();
  invalidateAuthorCourseListCache();

  return normalizeUuidResponse(responseBody);
}

export async function requestAddLessonToCourse(payload) {
  const normalizedCourseId = normalizeText(payload?.courseId);
  const responseBody = await requestCourseService("/lesson", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const lessonId = normalizeUuidResponse(responseBody);

  invalidateCourseCache(normalizedCourseId);
  invalidateLessonCache(lessonId);
  invalidateCourseListCache();
  invalidateAuthorCourseListCache();

  return lessonId;
}

export async function requestPublishCourse(courseId) {
  const normalizedCourseId = normalizeText(courseId);

  await requestCourseService(`/${normalizedCourseId}/publish`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
    },
  });

  invalidateCourseCache(normalizedCourseId);
  invalidateCourseListCache();
  invalidateAuthorCourseListCache();
}

export async function requestUploadLessonContent(lessonId, payload) {
  const normalizedLessonId = normalizeText(lessonId);
  const responseBody = await requestCourseService(
    `/lesson/${normalizedLessonId}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  invalidateLessonCache(normalizedLessonId);

  return responseBody;
}

export async function requestUploadLessonAsset(
  lessonId,
  { file, title, assetType },
) {
  const normalizedLessonId = normalizeText(lessonId);
  const formData = new FormData();

  const fileName =
    typeof file?.name === "string" && file.name.trim() ? file.name : "upload";
  formData.append("file", file, fileName);
  formData.append(
    "request",
    new Blob(
      [
        JSON.stringify({
          title: title ?? "",
          assetType: assetType ?? "",
        }),
      ],
      {
        type: "application/json",
      },
    ),
    "request.json",
  );

  const responseBody = await requestCourseService(
    `/lesson/${normalizedLessonId}/asset`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    },
  );

  invalidateLessonCache(normalizedLessonId);

  return responseBody;
}
