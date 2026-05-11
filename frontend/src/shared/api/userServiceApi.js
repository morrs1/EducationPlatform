import { isUuid, normalizeText } from "../lib/gatewayValues";
import {
  buildAvatarInitialsSeed,
  buildAvatarUrl,
  buildViewerDisplayName,
} from "../lib/viewerProfile";
import { withGatewayAuth } from "./gatewayFetch";

const DEFAULT_USER_SERVICE_API_BASE_URL = "/api/user";
const USER_SERVICE_MEDIA_PROXY_PATH = "/api/user-service-media";
const USER_SERVICE_STORAGE_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "user-service-seaweedfs",
]);
const viewerProfileRequestCache = new Map();

function buildUserServiceUrl(pathname = "") {
  const apiBaseUrl = getUserServiceApiBaseUrl();

  return new URL(`${apiBaseUrl}${pathname}`, window.location.origin);
}

async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => "");
}

function extractErrorMessage(response, responseBody, context = "") {
  if (responseBody && typeof responseBody === "object") {
    const message =
      responseBody.message ??
      responseBody.error ??
      responseBody.detail ??
      responseBody.title ??
      responseBody.msg;

    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  if (response.status === 404) {
    return "Данные не найдены.";
  }

  if (response.status === 401 || response.status === 403) {
    return context
      ? "Для этого действия нужно войти в аккаунт."
      : "Для этого действия нужно войти в аккаунт.";
  }

  if (response.status === 409) {
    // Used by "change_email" to report duplicate email.
    if (typeof context === "string" && context.toLowerCase().includes("email")) {
      return "Этот email уже используется другим аккаунтом.";
    }
  }

  return context
    ? "Не удалось выполнить действие. Попробуйте позже."
    : "Не удалось получить данные. Попробуйте позже.";
}

async function requestUserService(url, options = {}, context = "") {
  const response = await fetch(url.toString(), withGatewayAuth(options));
  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(response, responseBody, context));
  }

  return responseBody;
}

function getUserServiceApiBaseUrl() {
  const configuredBaseUrl = normalizeText(
    import.meta.env.VITE_USER_SERVICE_API_BASE_URL,
  );

  return configuredBaseUrl || DEFAULT_USER_SERVICE_API_BASE_URL;
}

function encodePathSegments(path) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function buildUserServiceMediaProxyUrl(bucket, key) {
  const normalizedBucket = normalizeText(bucket);
  const normalizedKey = normalizeText(key);

  if (!normalizedBucket || !normalizedKey) {
    return "";
  }

  return `${USER_SERVICE_MEDIA_PROXY_PATH}/${encodeURIComponent(
    normalizedBucket,
  )}/${encodePathSegments(normalizedKey)}`;
}

function buildUserProfilePhotoUploadUrl() {
  const direct = normalizeText(import.meta.env.VITE_USER_SERVICE_DIRECT_URL);

  if (direct) {
    return new URL("/user/add_photo", direct.endsWith("/") ? direct : `${direct}/`);
  }

  return buildUserServiceUrl("/add_photo");
}

function parseUserServiceStorageReference(value) {
  const normalizedUrl = normalizeText(value);

  if (!normalizedUrl) {
    return null;
  }

  if (normalizedUrl.startsWith(USER_SERVICE_MEDIA_PROXY_PATH)) {
    return null;
  }

  try {
    const sourceUrl = new URL(normalizedUrl, window.location.origin);

    if (sourceUrl.pathname.startsWith(USER_SERVICE_MEDIA_PROXY_PATH)) {
      return null;
    }

    if (sourceUrl.protocol === "s3:") {
      const key = sourceUrl.pathname.split("/").filter(Boolean).join("/");

      if (!sourceUrl.hostname || !key) {
        return null;
      }

      return {
        bucket: sourceUrl.hostname,
        key,
      };
    }

    const sourcePathSegments = sourceUrl.pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));

    const normalizedHostname = sourceUrl.hostname.toLowerCase();
    const isStorageHost =
      USER_SERVICE_STORAGE_HOSTS.has(normalizedHostname) ||
      normalizedHostname.endsWith("-seaweedfs");

    if (!isStorageHost) {
      return null;
    }

    if (sourcePathSegments[0] === "buckets" && sourcePathSegments.length >= 3) {
      return {
        bucket: sourcePathSegments[1],
        key: sourcePathSegments.slice(2).join("/"),
      };
    }

    if (sourcePathSegments.length >= 2) {
      return {
        bucket: sourcePathSegments[0],
        key: sourcePathSegments.slice(1).join("/"),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function normalizeUserServicePhotoUrl(value) {
  const normalizedUrl = normalizeText(value);

  if (!normalizedUrl) {
    return "";
  }

  const storageReference = parseUserServiceStorageReference(normalizedUrl);

  if (storageReference) {
    return buildUserServiceMediaProxyUrl(
      storageReference.bucket,
      storageReference.key,
    );
  }

  return normalizedUrl;
}

export function resolveRemoteViewerId(
  currentViewerId,
  preferredRemoteViewerId = null,
) {
  if (isUuid(preferredRemoteViewerId)) {
    return normalizeText(preferredRemoteViewerId);
  }

  if (isUuid(currentViewerId)) {
    return currentViewerId;
  }

  const fallbackViewerId = normalizeText(
    import.meta.env.VITE_USER_SERVICE_DEMO_USER_ID,
  );

  return isUuid(fallbackViewerId) ? fallbackViewerId : null;
}

export function mapReadUserByIdResponseToViewerProfile(response, viewerId) {
  const firstName = normalizeText(response?.name);
  const surname = normalizeText(response?.surname);
  const patronymic = normalizeText(response?.patronymic);
  const status = normalizeText(response?.userStatus);
  const displayName =
    buildViewerDisplayName(firstName, surname, patronymic) ||
    viewerId ||
    "Пользователь";
  const avatarUrl = normalizeUserServicePhotoUrl(
    response?.userProfilePhotoLink,
  );
  const avatarSeed =
    buildAvatarInitialsSeed({
      firstName,
      lastName: surname,
      name: displayName,
    }) || displayName;

  return {
    id: viewerId,
    firstName,
    lastName: surname,
    patronymic,
    name: displayName,
    email: normalizeText(response?.userEmail).toLowerCase(),
    status,
    headline: status,
    about: "",
    avatarUrl: avatarUrl || buildAvatarUrl(avatarSeed),
  };
}

export async function requestViewerProfileById(viewerId) {
  const normalizedViewerId = normalizeText(viewerId);

  if (!isUuid(normalizedViewerId)) {
    throw new Error("Не удалось определить пользователя.");
  }

  const cachedRequest = viewerProfileRequestCache.get(normalizedViewerId);

  if (cachedRequest) {
    return cachedRequest;
  }

  const url = buildUserServiceUrl("");

  url.searchParams.set("id", normalizedViewerId);

  const requestPromise = requestUserService(
    url,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
    `loading viewer ${normalizedViewerId}`,
  ).finally(() => {
    // Keep the cache only while the request is in flight.
    // Profile data can change after mutations, so storing fulfilled
    // responses here makes subsequent hydrations stale.
    viewerProfileRequestCache.delete(normalizedViewerId);
  });

  viewerProfileRequestCache.set(normalizedViewerId, requestPromise);

  return requestPromise;
}

export async function requestViewerDisplayProfileById(viewerId) {
  const normalizedViewerId = normalizeText(viewerId);
  const response = await requestViewerProfileById(normalizedViewerId);

  return mapReadUserByIdResponseToViewerProfile(response, normalizedViewerId);
}

function createJsonRequestOptions(payload) {
  return {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
    },
    body: JSON.stringify(payload),
  };
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

export async function requestViewerEmailUpdate(viewerId, oldEmail, newEmail) {
  const normalizedViewerId = normalizeText(viewerId);

  const normalizedOldEmail = normalizeEmail(oldEmail);
  const normalizedNewEmail = normalizeEmail(newEmail);

  if (!isUuid(normalizedViewerId)) {
    throw new Error("Не удалось определить пользователя.");
  }

  return requestUserService(
    buildUserServiceUrl(`/${normalizedViewerId}/change_email`),
    createJsonRequestOptions({
      oldEmail: normalizedOldEmail,
      newEmail: normalizedNewEmail,
    }),
    "изменение email",
  );
}

export async function requestViewerPasswordUpdate(
  viewerId,
  oldPassword,
  newPassword,
) {
  const normalizedViewerId = normalizeText(viewerId);
  const normalizedOldPassword = normalizeText(oldPassword);
  const normalizedNewPassword = normalizeText(newPassword);

  if (!isUuid(normalizedViewerId)) {
    throw new Error("Не удалось определить пользователя.");
  }

  return requestUserService(
    buildUserServiceUrl(`/${normalizedViewerId}/change_password`),
    createJsonRequestOptions({
      oldPassword: normalizedOldPassword,
      newPassword: normalizedNewPassword,
    }),
    "изменение пароля",
  );
}

export async function requestViewerNameUpdate(viewerId, nextFirstName) {
  return requestUserService(
    buildUserServiceUrl(`/${viewerId}/change_name`),
    createJsonRequestOptions({
      newName: nextFirstName,
    }),
  );
}

export async function requestViewerSurnameUpdate(viewerId, nextLastName) {
  return requestUserService(
    buildUserServiceUrl(`/${viewerId}/change_surname`),
    createJsonRequestOptions({
      newSurname: nextLastName,
    }),
  );
}

export async function requestViewerPatronymicUpdate(
  viewerId,
  nextPatronymic,
) {
  return requestUserService(
    buildUserServiceUrl(`/${viewerId}/change_patronymic`),
    createJsonRequestOptions({
      newPatronymic: nextPatronymic,
    }),
  );
}

export async function requestViewerStatusUpdate(viewerId, nextStatus) {
  return requestUserService(
    buildUserServiceUrl(`/${viewerId}/change_status`),
    createJsonRequestOptions({
      newStatus: nextStatus,
    }),
  );
}

export async function uploadViewerProfilePhoto(viewerId, file) {
  const formData = new FormData();

  formData.set("user_id", viewerId);
  formData.set("file", file);

  return requestUserService(buildUserProfilePhotoUploadUrl(), {
    method: "POST",
    body: formData,
  });
}

export async function requestAssignAuthorRole(viewerId) {
  const normalizedViewerId = normalizeText(viewerId);

  if (!isUuid(normalizedViewerId)) {
    throw new Error("userId должен быть UUID.");
  }

  return requestUserService(
    buildUserServiceUrl(`/${normalizedViewerId}/assign_author`),
    {
      method: "PATCH",
      headers: {
        Accept: "text/plain",
      },
    },
    "назначение роли автора",
  );
}

export async function requestAssignAdminRole(viewerId) {
  const normalizedViewerId = normalizeText(viewerId);

  if (!isUuid(normalizedViewerId)) {
    throw new Error("userId должен быть UUID.");
  }

  return requestUserService(
    buildUserServiceUrl(`/${normalizedViewerId}/assign_admin`),
    {
      method: "PATCH",
      headers: {
        Accept: "text/plain",
      },
    },
    "назначение роли администратора",
  );
}
