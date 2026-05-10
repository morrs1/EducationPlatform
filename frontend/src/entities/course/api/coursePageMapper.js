import {
  formatCourseTagLabel,
  sanitizeCourseDisplayLabel,
} from "../model/courseDisplayLabels";
import {
  normalizeArray,
  normalizeInteger,
  normalizeText,
  unwrapBoolean,
  unwrapInteger,
  unwrapString,
} from "./courseServiceCommon";
import {
  formatMinutesLabel,
  sortByPosition,
} from "./courseServiceMapperUtils";

function formatDifficultyLabel(difficulty) {
  if (difficulty === "beginner") {
    return "Начальный уровень";
  }

  if (difficulty === "intermediate") {
    return "Продвинутый уровень";
  }

  return "Уровень пока не указан";
}

function buildCourseEyebrow(tags, difficulty) {
  const primaryTag =
    formatCourseTagLabel(tags?.[0]) || sanitizeCourseDisplayLabel("");
  const parts = [formatDifficultyLabel(difficulty)];

  return {
    categoryName: primaryTag,
    subcategoryName: parts.join(" · "),
  };
}

function mapLessonTypeToCounters(type) {
  if (type === "quiz") {
    return { tests: 1, tasks: 0 };
  }

  if (type === "coding") {
    return { tests: 0, tasks: 1 };
  }

  return { tests: 0, tasks: 0 };
}

function mapLessonPreview(lesson, lessonIndex) {
  const estimatedMinutes = unwrapInteger(lesson?.estimatedMinutes, "estimatedMinutes");
  const lessonId =
    normalizeText(lesson?.id) || `backend-lesson-${lessonIndex + 1}`;

  return {
    id: lessonId,
    lessonId,
    title: unwrapString(lesson?.title, "title") || `Урок ${lessonIndex + 1}`,
    durationLabel: formatMinutesLabel(estimatedMinutes),
    type: unwrapString(lesson?.type, "lessonType") || "theory",
    position: unwrapInteger(lesson?.position, "position") ?? lessonIndex + 1,
    estimatedMinutes,
    isPreview:
      unwrapBoolean(lesson?.isPreview, "isPreview") ||
      unwrapBoolean(lesson?.isPreview, "preview"),
  };
}

function mapModule(module, moduleIndex) {
  const lessons = sortByPosition(
    normalizeArray(module?.lessons).map(mapLessonPreview),
  );
  const estimatedMinutes = unwrapInteger(module?.estimatedMinutes, "estimatedMinutes");

  return {
    id: normalizeText(module?.id) || `backend-module-${moduleIndex + 1}`,
    title: unwrapString(module?.title, "title") || `Модуль ${moduleIndex + 1}`,
    summary:
      unwrapString(module?.description, "description") ||
      "Описание модуля пока не указано.",
    description: unwrapString(module?.description, "description"),
    position: unwrapInteger(module?.position, "position") ?? moduleIndex + 1,
    estimatedMinutes,
    durationLabel: formatMinutesLabel(estimatedMinutes),
    lessons,
  };
}

function resolveCourseIdFromCourseResponse(response, fallbackCourseId = "") {
  const explicitId = normalizeText(response?.id) || normalizeText(fallbackCourseId);

  if (explicitId) {
    return explicitId;
  }

  const moduleCourseId = normalizeArray(response?.structure)
    .map((module) => normalizeText(module?.courseId))
    .find(Boolean);

  return moduleCourseId || "";
}

function countCourseStats(modules) {
  return modules.reduce(
    (accumulator, module) => {
      module.lessons.forEach((lesson) => {
        const counters = mapLessonTypeToCounters(lesson.type);

        accumulator.lessonsCount += 1;
        accumulator.testsCount += counters.tests;
        accumulator.tasksCount += counters.tasks;
      });

      return accumulator;
    },
    {
      lessonsCount: 0,
      testsCount: 0,
      tasksCount: 0,
    },
  );
}

export function mapReadCourseByIdResponseToCoursePageData(response, courseId) {
  const resolvedCourseId = resolveCourseIdFromCourseResponse(response, courseId);
  const modules = sortByPosition(normalizeArray(response?.structure).map(mapModule));
  const tags = normalizeArray(response?.tags)
    .map((tag) => unwrapString(tag?.name, "name"))
    .filter(Boolean);
  const estimatedMinutes = normalizeInteger(response?.estimatedMinutes) ?? 0;
  const courseStats = countCourseStats(modules);
  const eyebrow = buildCourseEyebrow(
    tags,
    normalizeText(response?.difficulty),
  );
  const isPublished = unwrapBoolean(response?.isPreview, "isPreview");

  return {
    course: {
      id: resolvedCourseId || courseId,
      authorId: normalizeText(response?.authorId),
      authorName: normalizeText(response?.authorName),
      title: normalizeText(response?.title) || "Курс без названия",
      shortDescription:
        normalizeText(response?.shortDescription) ||
        "Короткое описание курса пока не указано.",
      description:
        normalizeText(response?.description) ||
        "Описание курса пока не заполнено.",
      difficulty: normalizeText(response?.difficulty),
      level: normalizeText(response?.difficulty),
      languageCode: normalizeText(response?.languageCode),
      estimatedMinutes,
      durationLabel: formatMinutesLabel(estimatedMinutes),
      lessonsCount: courseStats.lessonsCount,
      testsCount: courseStats.testsCount,
      tasksCount: courseStats.tasksCount,
      rating: null,
      studentsCount: null,
      categoryId: null,
      subcategoryId: null,
      categoryIcon: "📘",
      categoryName: eyebrow.categoryName,
      subcategoryName: eyebrow.subcategoryName,
      coverUrl: "",
      imageUrl: "",
      tags,
      createdAt: normalizeText(response?.createdAt),
      updatedAt: normalizeText(response?.updatedAt),
      isPublished,
      isDraft: !isPublished,
      isBackendCourse: true,
      isReadOnlyCourse: false,
      isEnrolled: false,
      isCompleted: false,
    },
    syllabus: {
      courseId,
      modules,
    },
    reviews: [],
  };
}
