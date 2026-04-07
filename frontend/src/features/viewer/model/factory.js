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

function buildFullName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
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
  const email = normalizeText(value?.email, { lowercase: true });
  const explicitName = normalizeText(value?.name);
  const fallbackName =
    explicitName ||
    buildFullName(firstName, lastName) ||
    email ||
    normalizeText(value?.id) ||
    "Новый студент";

  return {
    id: normalizeText(value?.id) || null,
    firstName,
    lastName,
    name: fallbackName,
    email,
    headline: normalizeText(value?.headline),
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
    name: "Новый студент",
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
    firstName,
    lastName,
    name: normalizedFullName || buildFullName(firstName, lastName),
    email,
    headline: "Начинает собирать свой учебный трек",
    about: "",
    enrolledCourseIds: [],
    favouriteCourseIds: [],
    completedCourseIds: [],
    certificateCourseIds: [],
    progressByCourseId: {},
  });
}
