import { mockViewer } from "./mockViewer";
import {
  buildAvatarUrl,
  buildAvatarInitialsSeed,
  buildViewerDisplayName,
} from "../../../shared/lib/viewerProfile";

export {
  buildAvatarUrl,
  buildAvatarInitialsSeed,
  buildViewerDisplayName,
} from "../../../shared/lib/viewerProfile";

function normalizeText(value, { lowercase = false } = {}) {
  if (typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.trim();

  return lowercase ? normalizedValue.toLowerCase() : normalizedValue;
}

const INTEGER_ID_PATTERN = /^\d+$/;

function sanitizeCourseDisplayLabel(value, fallback = "Курс") {
  const normalizedValue = normalizeText(value);
  const normalizedSearchValue = normalizedValue.toLowerCase();

  if (
    !normalizedValue ||
    ["frontend", "backend", "bd", "db"].includes(normalizedSearchValue) ||
    normalizedSearchValue.includes("курс из базы данных") ||
    normalizedSearchValue.includes("база данных") ||
    normalizedSearchValue.includes("базы данных") ||
    normalizedSearchValue.includes("database")
  ) {
    return fallback;
  }

  return normalizedValue;
}

export function normalizeViewerCourseId(value) {
  if (Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  if (INTEGER_ID_PATTERN.test(normalizedValue)) {
    return Number(normalizedValue);
  }

  return normalizedValue;
}

export function getViewerCourseStorageKey(courseId) {
  const normalizedCourseId = normalizeViewerCourseId(courseId);

  return normalizedCourseId == null ? null : String(normalizedCourseId);
}

function normalizeCourseIdList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueCourseIds = new Map();

  value.forEach((courseId) => {
    const normalizedCourseId = normalizeViewerCourseId(courseId);

    if (normalizedCourseId == null) {
      return;
    }

    uniqueCourseIds.set(String(normalizedCourseId), normalizedCourseId);
  });

  return Array.from(uniqueCourseIds.values());
}

function normalizeProgressByCourseId(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce((progressMap, [courseId, progress]) => {
    const storageKey = getViewerCourseStorageKey(courseId);

    if (!storageKey) {
      return progressMap;
    }

    progressMap[storageKey] = {
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

function normalizeCourseSnapshotArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedLessonIds = [];
  const seenLessonIds = new Set();

  value.forEach((lessonId) => {
    const normalizedLessonId = normalizeViewerCourseId(lessonId);

    if (normalizedLessonId == null) {
      return;
    }

    const lessonStorageKey = String(normalizedLessonId);

    if (seenLessonIds.has(lessonStorageKey)) {
      return;
    }

    seenLessonIds.add(lessonStorageKey);
    normalizedLessonIds.push(normalizedLessonId);
  });

  return normalizedLessonIds;
}

export function normalizeViewerCourseSnapshot(value) {
  const normalizedCourseId = normalizeViewerCourseId(value?.id);

  if (normalizedCourseId == null) {
    return null;
  }

  return {
    id: normalizedCourseId,
    authorId: value?.authorId ?? null,
    authorName: normalizeText(value?.authorName) || "Автор курса",
    title: normalizeText(value?.title) || "Курс без названия",
    shortDescription: normalizeText(value?.shortDescription),
    categoryId: normalizeViewerCourseId(value?.categoryId) ?? null,
    categoryName: sanitizeCourseDisplayLabel(value?.categoryName),
    categoryIcon: normalizeText(value?.categoryIcon) || "📘",
    subcategoryId: normalizeViewerCourseId(value?.subcategoryId) ?? null,
    subcategoryName: sanitizeCourseDisplayLabel(
      value?.subcategoryName,
      "Материалы курса",
    ),
    level: normalizeText(value?.level) || "beginner",
    durationLabel: normalizeText(value?.durationLabel) || "Длительность уточняется",
    studentsCount: Number.isFinite(value?.studentsCount)
      ? value.studentsCount
      : null,
    lessonsCount: Number(value?.lessonsCount) || 0,
    testsCount: Number(value?.testsCount) || 0,
    tasksCount: Number(value?.tasksCount) || 0,
    coverUrl: normalizeText(value?.coverUrl),
    imageUrl: normalizeText(value?.imageUrl),
    isPublished: Boolean(value?.isPublished),
    isDraft:
      typeof value?.isDraft === "boolean"
        ? value.isDraft
        : !value?.isPublished,
    isBackendCourse: Boolean(value?.isBackendCourse),
    syllabusLessonIds: normalizeCourseSnapshotArray(value?.syllabusLessonIds),
  };
}

function normalizeCourseSnapshotsById(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.values(value).reduce((snapshotsMap, snapshot) => {
    const normalizedSnapshot = normalizeViewerCourseSnapshot(snapshot);

    if (!normalizedSnapshot) {
      return snapshotsMap;
    }

    snapshotsMap[String(normalizedSnapshot.id)] = normalizedSnapshot;

    return snapshotsMap;
  }, {});
}

export function createViewerCourseSnapshot(course, syllabusLessonIds = []) {
  return normalizeViewerCourseSnapshot({
    id: course?.id,
    authorId: course?.authorId ?? null,
    authorName: course?.authorName,
    title: course?.title,
    shortDescription: course?.shortDescription,
    categoryId: course?.categoryId,
    categoryName: course?.categoryName,
    categoryIcon: course?.categoryIcon,
    subcategoryId: course?.subcategoryId,
    subcategoryName: course?.subcategoryName,
    level: course?.level,
    durationLabel: course?.durationLabel,
    studentsCount: course?.studentsCount,
    lessonsCount: course?.lessonsCount,
    testsCount: course?.testsCount,
    tasksCount: course?.tasksCount,
    coverUrl: course?.coverUrl,
    imageUrl: course?.imageUrl,
    isPublished: course?.isPublished,
    isDraft: course?.isDraft,
    isBackendCourse: course?.isBackendCourse,
    syllabusLessonIds,
  });
}

function splitFullName(fullName) {
  const normalizedFullName = normalizeText(fullName);

  if (!normalizedFullName) {
    return {
      firstName: "",
      lastName: "",
      patronymic: "",
    };
  }

  const nameParts = normalizedFullName.split(/\s+/);

  if (nameParts.length === 1) {
    return {
      firstName: nameParts[0],
      lastName: "",
      patronymic: "",
    };
  }

  const [lastName = "", firstName = "", ...patronymicParts] = nameParts;

  return {
    firstName,
    lastName,
    patronymic: patronymicParts.join(" "),
  };
}

export function normalizeViewerProfile(value) {
  const firstName = normalizeText(value?.firstName);
  const lastName = normalizeText(value?.lastName);
  const patronymic = normalizeText(value?.patronymic);
  const email = normalizeText(value?.email, { lowercase: true });
  const status = normalizeText(value?.status) || normalizeText(value?.headline);
  const explicitName = normalizeText(value?.name);
  const structuredName = buildViewerDisplayName(
    firstName,
    lastName,
    patronymic,
  );
  const fallbackName =
    structuredName ||
    explicitName ||
    email ||
    normalizeText(value?.id) ||
    "Новый студент";
  const avatarSeed =
    buildAvatarInitialsSeed({
      firstName,
      lastName,
      name: structuredName || explicitName || fallbackName,
    }) || fallbackName;

  return {
    id: normalizeText(value?.id) || null,
    remoteId: normalizeText(value?.remoteId) || null,
    firstName,
    lastName,
    patronymic,
    name: fallbackName,
    email,
    status,
    headline: normalizeText(value?.headline) || status,
    about: normalizeText(value?.about),
    avatarUrl: normalizeText(value?.avatarUrl) || buildAvatarUrl(avatarSeed),
    enrolledCourseIds: normalizeCourseIdList(value?.enrolledCourseIds),
    completedCourseIds: normalizeCourseIdList(value?.completedCourseIds),
    certificateCourseIds: normalizeCourseIdList(value?.certificateCourseIds),
    progressByCourseId: normalizeProgressByCourseId(value?.progressByCourseId),
    courseSnapshotsById: normalizeCourseSnapshotsById(value?.courseSnapshotsById),
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
  status,
  avatarUrl,
}) {
  const normalizedFullName = normalizeText(fullName);
  const normalizedStatus = normalizeText(status);
  const fallbackHeadline =
    normalizedStatus || "Начинает собирать свой учебный трек";
  const { firstName, lastName, patronymic } = splitFullName(normalizedFullName);

  return normalizeViewerProfile({
    id: viewerId,
    remoteId: null,
    firstName,
    lastName,
    patronymic,
    name:
      buildViewerDisplayName(firstName, lastName, patronymic) ||
      normalizedFullName,
    email,
    status: normalizedStatus,
    headline: fallbackHeadline,
    about: "",
    avatarUrl: normalizeText(avatarUrl),
    enrolledCourseIds: [],
    completedCourseIds: [],
    certificateCourseIds: [],
    progressByCourseId: {},
  });
}
