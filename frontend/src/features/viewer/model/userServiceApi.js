import { buildAvatarUrl } from "./factory";

const DEFAULT_USER_SERVICE_API_BASE_URL = "/api/user-service";
const USER_SERVICE_MEDIA_PROXY_PATH = "/api/user-service-media";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isUuid(value) {
  return UUID_PATTERN.test(normalizeText(value));
}

function joinNameParts(...parts) {
  return parts.filter(Boolean).join(" ").trim();
}

function buildUserServiceUrl(pathname = "/user") {
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
  if (typeof responseBody === "string" && responseBody.trim()) {
    return responseBody.trim();
  }

  if (
    responseBody &&
    typeof responseBody === "object" &&
    !Array.isArray(responseBody)
  ) {
    if (typeof responseBody.msg === "string" && responseBody.msg.trim()) {
      return responseBody.msg.trim();
    }

    if (
      typeof responseBody.message === "string" &&
      responseBody.message.trim()
    ) {
      return responseBody.message.trim();
    }
  }

  return context
    ? `user_service returned ${response.status} while ${context}.`
    : `user_service returned ${response.status}.`;
}

async function requestUserService(url, options = {}, context = "") {
  const response = await fetch(url.toString(), options);
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

export function normalizeUserServicePhotoUrl(value) {
  const normalizedUrl = normalizeText(value);

  if (!normalizedUrl) {
    return "";
  }

  try {
    const sourceUrl = new URL(normalizedUrl);
    const sourcePathSegments = sourceUrl.pathname.split("/").filter(Boolean);

    if (sourceUrl.protocol === "s3:") {
      if (!sourceUrl.hostname || !sourcePathSegments.length) {
        return normalizedUrl;
      }

      return `${USER_SERVICE_MEDIA_PROXY_PATH}/${encodeURIComponent(
        sourceUrl.hostname,
      )}/${sourcePathSegments
        .map((segment) => encodeURIComponent(segment))
        .join("/")}`;
    }

    if (!sourcePathSegments.length) {
      return normalizedUrl;
    }

    if (sourcePathSegments.length < 2) {
      return normalizedUrl;
    }

    const [bucket, ...keySegments] = sourcePathSegments;

    return `${USER_SERVICE_MEDIA_PROXY_PATH}/${encodeURIComponent(
      bucket,
    )}/${keySegments.map((segment) => encodeURIComponent(segment)).join("/")}`;
  } catch {
    return normalizedUrl;
  }
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
    joinNameParts(firstName, patronymic, surname) ||
    joinNameParts(firstName, surname) ||
    viewerId ||
    "Пользователь";
  const avatarUrl = normalizeUserServicePhotoUrl(
    response?.userProfilePhotoLink,
  );

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
    avatarUrl: avatarUrl || buildAvatarUrl(displayName),
  };
}

export async function requestViewerProfileById(viewerId) {
  const url = buildUserServiceUrl("/user");

  url.searchParams.set("id", viewerId);

  return requestUserService(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  }, `loading viewer ${viewerId}`);
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

export async function requestViewerNameUpdate(viewerId, nextFirstName) {
  return requestUserService(
    buildUserServiceUrl(`/user/${viewerId}/change_name`),
    createJsonRequestOptions({
      newName: nextFirstName,
    }),
  );
}

export async function requestViewerSurnameUpdate(viewerId, nextLastName) {
  return requestUserService(
    buildUserServiceUrl(`/user/${viewerId}/change_surname`),
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
    buildUserServiceUrl(`/user/${viewerId}/change_patronymic`),
    createJsonRequestOptions({
      newPatronymic: nextPatronymic,
    }),
  );
}

export async function requestViewerStatusUpdate(viewerId, nextStatus) {
  return requestUserService(
    buildUserServiceUrl(`/user/${viewerId}/change_status`),
    createJsonRequestOptions({
      newStatus: nextStatus,
    }),
  );
}

export async function uploadViewerProfilePhoto(viewerId, file) {
  const formData = new FormData();

  formData.set("user_id", viewerId);
  formData.set("file", file);

  return requestUserService(buildUserServiceUrl("/user/add_photo"), {
    method: "POST",
    body: formData,
  });
}
