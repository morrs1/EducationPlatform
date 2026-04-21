const DEFAULT_COURSE_SERVICE_API_BASE_URL = "/api/course-service";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeInteger(value) {
  return Number.isFinite(value) ? value : null;
}

function unwrapString(value, key) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object" && typeof value[key] === "string") {
    return value[key].trim();
  }

  return "";
}

function unwrapInteger(value, key) {
  if (Number.isFinite(value)) {
    return value;
  }

  if (value && typeof value === "object" && Number.isFinite(value[key])) {
    return value[key];
  }

  return null;
}

function unwrapBoolean(value, key) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value && typeof value === "object" && typeof value[key] === "boolean") {
    return value[key];
  }

  return false;
}

function readResponseBody(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => "");
}

function extractErrorMessage(response, responseBody) {
  if (typeof responseBody === "string" && responseBody.trim()) {
    return responseBody.trim();
  }

  if (
    responseBody &&
    typeof responseBody === "object" &&
    !Array.isArray(responseBody)
  ) {
    if (typeof responseBody.message === "string" && responseBody.message.trim()) {
      return responseBody.message.trim();
    }

    if (typeof responseBody.msg === "string" && responseBody.msg.trim()) {
      return responseBody.msg.trim();
    }
  }

  return `course_service returned ${response.status}.`;
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

function formatDifficultyLabel(difficulty) {
  if (difficulty === "beginner") {
    return "Начальный уровень";
  }

  if (difficulty === "intermediate") {
    return "Средний уровень";
  }

  if (difficulty === "advanced") {
    return "Продвинутый уровень";
  }

  return "Уровень пока не указан";
}

function formatMinutesLabel(estimatedMinutes) {
  if (!Number.isFinite(estimatedMinutes) || estimatedMinutes <= 0) {
    return "Длительность уточняется";
  }

  if (estimatedMinutes < 60) {
    return `${estimatedMinutes} мин`;
  }

  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;

  if (minutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${minutes} мин`;
}

function buildCourseEyebrow(tags, difficulty, languageCode) {
  const primaryTag = normalizeText(tags[0]);
  const parts = [formatDifficultyLabel(difficulty)];

  if (normalizeText(languageCode)) {
    parts.push(`Язык: ${languageCode}`);
  }

  return {
    categoryName: primaryTag || "Курс из базы данных",
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

function mapLesson(lesson, lessonIndex) {
  const estimatedMinutes = unwrapInteger(lesson?.estimatedMinutes, "estimatedMinutes");

  return {
    id: normalizeText(lesson?.id) || `backend-lesson-${lessonIndex + 1}`,
    title: unwrapString(lesson?.title, "title") || `Урок ${lessonIndex + 1}`,
    durationLabel: formatMinutesLabel(estimatedMinutes),
    type: unwrapString(lesson?.type, "lessonType") || "theory",
    position: unwrapInteger(lesson?.position, "position") ?? lessonIndex + 1,
    estimatedMinutes,
    isPreview: unwrapBoolean(lesson?.isPreview, "preview"),
    lessonId: null,
  };
}

function mapModule(module, moduleIndex) {
  const lessons = normalizeArray(module?.lessons).map(mapLesson);
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

export function isUuid(value) {
  return UUID_PATTERN.test(normalizeText(value));
}

export async function requestCourseById(courseId) {
  const response = await fetch(buildCourseServiceUrl(`/course/${courseId}`), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(response, responseBody));
  }

  return responseBody;
}

export function mapReadCourseByIdResponseToCoursePageData(response, courseId) {
  const modules = normalizeArray(response?.structure).map(mapModule);
  const tags = normalizeArray(response?.tags)
    .map((tag) => unwrapString(tag?.name, "name"))
    .filter(Boolean);
  const estimatedMinutes = normalizeInteger(response?.estimatedMinutes) ?? 0;
  const courseStats = countCourseStats(modules);
  const eyebrow = buildCourseEyebrow(
    tags,
    normalizeText(response?.difficulty),
    normalizeText(response?.languageCode),
  );

  return {
    course: {
      id: courseId,
      authorId: normalizeText(response?.authorId),
      authorName: normalizeText(response?.authorId) || "Автор пока не подключен",
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
      categoryIcon: "DB",
      categoryName: eyebrow.categoryName,
      subcategoryName: eyebrow.subcategoryName,
      coverUrl: "",
      imageUrl: "",
      tags,
      createdAt: normalizeText(response?.createdAt),
      updatedAt: normalizeText(response?.updatedAt),
      isBackendCourse: true,
      isReadOnlyCourse: true,
      isEnrolled: true,
      isFavourite: false,
      isCompleted: false,
    },
    syllabus: {
      courseId,
      modules,
    },
    reviews: [],
  };
}
