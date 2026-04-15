import { buildAvatarUrl } from "./factory";

const DEFAULT_USER_SERVICE_API_BASE_URL = "/api/user-service";
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

function getUserServiceApiBaseUrl() {
  const configuredBaseUrl = normalizeText(
    import.meta.env.VITE_USER_SERVICE_API_BASE_URL,
  );

  return configuredBaseUrl || DEFAULT_USER_SERVICE_API_BASE_URL;
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
  const displayName =
    joinNameParts(firstName, patronymic, surname) ||
    joinNameParts(firstName, surname) ||
    viewerId ||
    "Пользователь";
  const lastName = joinNameParts(surname, patronymic);
  const avatarUrl = normalizeText(response?.userProfilePhotoLink);

  return {
    id: viewerId,
    firstName,
    lastName,
    name: displayName,
    email: normalizeText(response?.userEmail).toLowerCase(),
    headline: normalizeText(response?.userStatus),
    about: "",
    avatarUrl: avatarUrl || buildAvatarUrl(displayName),
    enrolledCourseIds: response?.currentCourses ?? [],
    completedCourseIds: response?.finishedCourses ?? [],
    certificateCourseIds: response?.certificates ?? [],
  };
}

export async function requestViewerProfileById(viewerId) {
  const apiBaseUrl = getUserServiceApiBaseUrl();
  const url = new URL(`${apiBaseUrl}/user`, window.location.origin);

  url.searchParams.set("id", viewerId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `user_service returned ${response.status} while loading viewer ${viewerId}.`,
    );
  }

  return response.json();
}
