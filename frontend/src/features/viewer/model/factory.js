import { mockViewer } from "./mockViewer";

function normalizeText(value, { lowercase = false } = {}) {
  if (typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.trim();

  return lowercase ? normalizedValue.toLowerCase() : normalizedValue;
}

function normalizeCourseIdList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((courseId) => Number(courseId))
        .filter((courseId) => Number.isFinite(courseId)),
    ),
  );
}

function normalizeProgressByCourseId(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce((progressMap, [courseId, progress]) => {
    const normalizedCourseId = Number(courseId);

    if (!Number.isFinite(normalizedCourseId)) {
      return progressMap;
    }

    progressMap[normalizedCourseId] = {
      completedLessons: Number(progress?.completedLessons) || 0,
      completedTests: Number(progress?.completedTests) || 0,
      completedTasks: Number(progress?.completedTasks) || 0,
      lastVisitedAt:
        typeof progress?.lastVisitedAt === "string" && progress.lastVisitedAt
          ? progress.lastVisitedAt
          : null,
    };

    return progressMap;
  }, {});
}

function buildFullName(firstName, lastName, patronymic = "") {
  return [firstName, patronymic, lastName].filter(Boolean).join(" ").trim();
}

function splitFullName(fullName) {
  const normalizedFullName = normalizeText(fullName);

  if (!normalizedFullName) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  const [firstName = "", ...restNameParts] = normalizedFullName.split(/\s+/);

  return {
    firstName,
    lastName: restNameParts.join(" ").trim(),
  };
}

export function buildAvatarUrl(seed) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;
}

export function normalizeViewerProfile(value) {
  const firstName = normalizeText(value?.firstName);
  const lastName = normalizeText(value?.lastName);
  const patronymic = normalizeText(value?.patronymic);
  const email = normalizeText(value?.email, { lowercase: true });
  const status =
    normalizeText(value?.status) || normalizeText(value?.headline);
  const explicitName = normalizeText(value?.name);
  const fallbackName =
    explicitName ||
    buildFullName(firstName, lastName, patronymic) ||
    email ||
    normalizeText(value?.id) ||
    "Новый студент";

  return {
    id: normalizeText(value?.id) || null,
    remoteId: normalizeText(value?.remoteId) || null,
    firstName,
    lastName,
    patronymic,
    name: fallbackName,
    email,
    status,
    headline: status,
    about: normalizeText(value?.about),
    avatarUrl: normalizeText(value?.avatarUrl) || buildAvatarUrl(fallbackName),
    enrolledCourseIds: normalizeCourseIdList(value?.enrolledCourseIds),
    favouriteCourseIds: normalizeCourseIdList(value?.favouriteCourseIds),
    completedCourseIds: normalizeCourseIdList(value?.completedCourseIds),
    certificateCourseIds: normalizeCourseIdList(value?.certificateCourseIds),
    progressByCourseId: normalizeProgressByCourseId(value?.progressByCourseId),
  };
}

export function createInitialViewerState() {
  return normalizeViewerProfile(mockViewer);
}

export function createEmptyViewerProfile(viewerId = null) {
  return normalizeViewerProfile({
    id: viewerId,
    remoteId: null,
    name: "Новый студент",
    patronymic: "",
    status: "",
    headline: "",
    about: "",
  });
}

export function createViewerProfileFromRegistration({
  viewerId,
  email,
  fullName,
}) {
  const normalizedFullName = normalizeText(fullName);
  const { firstName, lastName } = splitFullName(normalizedFullName);

  return normalizeViewerProfile({
    id: viewerId,
    remoteId: null,
    firstName,
    lastName,
    patronymic: "",
    name: normalizedFullName || buildFullName(firstName, lastName),
    email,
    status: "STUDENT",
    headline: "STUDENT",
    about: "",
    enrolledCourseIds: [],
    favouriteCourseIds: [],
    completedCourseIds: [],
    certificateCourseIds: [],
    progressByCourseId: {},
  });
}
