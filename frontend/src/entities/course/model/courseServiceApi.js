const DEFAULT_COURSE_SERVICE_API_BASE_URL = "/api/course-service";
const COURSE_SERVICE_MEDIA_PROXY_PATH = "/api/course-service-media";
const USER_SERVICE_MEDIA_PROXY_PATH = "/api/user-service-media";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const courseRequestCache = new Map();
const lessonRequestCache = new Map();

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeInteger(value) {
  return Number.isFinite(value) ? value : null;
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
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

function buildCourseServiceMediaProxyUrl(storageKey) {
  const normalizedStorageKey = normalizeText(storageKey);

  if (!normalizedStorageKey) {
    return "";
  }

  return `${COURSE_SERVICE_MEDIA_PROXY_PATH}/${normalizedStorageKey
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

function buildBucketMediaProxyUrl(bucket, key) {
  const normalizedBucket = normalizeText(bucket);
  const normalizedKey = normalizeText(key);

  if (!normalizedBucket || !normalizedKey) {
    return "";
  }

  return `${USER_SERVICE_MEDIA_PROXY_PATH}/${encodeURIComponent(
    normalizedBucket,
  )}/${normalizedKey
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

function normalizeDirectAssetUrl(url) {
  const normalizedUrl = normalizeText(url);

  if (!normalizedUrl) {
    return "";
  }

  try {
    const parsedUrl = new URL(normalizedUrl, window.location.origin);

    if (parsedUrl.protocol === "s3:") {
      return buildBucketMediaProxyUrl(
        parsedUrl.hostname,
        parsedUrl.pathname.split("/").filter(Boolean).join("/"),
      );
    }

    return parsedUrl.toString();
  } catch {
    return normalizedUrl;
  }
}

function isPlaceholderAssetUrl(url) {
  const normalizedUrl = normalizeText(url);

  if (!normalizedUrl) {
    return false;
  }

  try {
    const parsedUrl = new URL(normalizedUrl, window.location.origin);

    return (
      parsedUrl.hostname === "cdn.example.local" ||
      parsedUrl.hostname.endsWith(".example.local")
    );
  } catch {
    return false;
  }
}

function normalizeLessonAssetType(type, mimeType) {
  const normalizedType = normalizeText(type).toLowerCase();
  const normalizedMimeType = normalizeText(mimeType).toLowerCase();

  if (normalizedType === "image" || normalizedType === "cover") {
    return "image";
  }

  if (normalizedType === "video") {
    return "video";
  }

  if (normalizedType === "file") {
    return "file";
  }

  if (normalizedMimeType.startsWith("image/")) {
    return "image";
  }

  if (normalizedMimeType.startsWith("video/")) {
    return "video";
  }

  return "file";
}

function getLessonAssetSortWeight(type) {
  if (type === "image") {
    return 0;
  }

  if (type === "video") {
    return 1;
  }

  return 2;
}

function resolveLessonAssetUrl(publicUrl, storageKey) {
  const normalizedPublicUrl = normalizeDirectAssetUrl(publicUrl);

  if (normalizedPublicUrl && !isPlaceholderAssetUrl(normalizedPublicUrl)) {
    return normalizedPublicUrl;
  }

  const storageProxyUrl = buildCourseServiceMediaProxyUrl(storageKey);

  if (storageProxyUrl) {
    return storageProxyUrl;
  }

  return normalizedPublicUrl;
}

function mapLessonAsset(asset, assetIndex) {
  const mimeType = unwrapString(asset?.mimeType, "mimeType");
  const type = normalizeLessonAssetType(
    unwrapString(asset?.type, "assetType"),
    mimeType,
  );
  const storageKey = unwrapString(asset?.storageKey, "storageKey");
  const publicUrl = unwrapString(asset?.publicUrl, "publicUrl");
  const originalFilename = unwrapString(
    asset?.originalFilename,
    "originalFilename",
  );
  const resolvedUrl = resolveLessonAssetUrl(publicUrl, storageKey);

  return {
    id: normalizeText(asset?.id) || `backend-asset-${assetIndex + 1}`,
    type,
    title:
      unwrapString(asset?.title, "title") ||
      originalFilename ||
      `Материал ${assetIndex + 1}`,
    originalFilename,
    mimeType,
    sizeBytes: unwrapInteger(asset?.sizeBytes, "sizeBytes"),
    storageKey,
    publicUrl,
    url: resolvedUrl,
    isResolved: Boolean(resolvedUrl),
    createdAt: normalizeText(asset?.createdAt),
  };
}

function mapLessonAssets(assets) {
  return normalizeArray(assets)
    .map(mapLessonAsset)
    .sort((left, right) => {
      const typeDifference =
        getLessonAssetSortWeight(left.type) - getLessonAssetSortWeight(right.type);

      if (typeDifference !== 0) {
        return typeDifference;
      }

      return left.title.localeCompare(right.title, "ru");
    });
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

function sortByPosition(items) {
  return [...items].sort((left, right) => {
    const leftPosition = left?.position ?? 0;
    const rightPosition = right?.position ?? 0;

    return leftPosition - rightPosition;
  });
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

function mapBackendQuestionType(questionType) {
  const normalizedType = normalizeText(questionType).toLowerCase();

  if (
    normalizedType === "text" ||
    normalizedType === "text_input" ||
    normalizedType === "short_answer"
  ) {
    return "text";
  }

  if (normalizedType === "multiple_choice") {
    return "multiple_choice";
  }

  return "single_choice";
}

function mapQuizQuestion(question, questionIndex) {
  const mappedType = mapBackendQuestionType(question?.type);
  const questionId =
    normalizeText(question?.id) || `backend-question-${questionIndex + 1}`;
  const options = normalizeArray(question?.options).map((option, optionIndex) => ({
    id:
      normalizeText(option?.id) ||
      `${questionId}-option-${optionIndex + 1}`,
    label: unwrapString(option?.text, "text") || `Вариант ${optionIndex + 1}`,
    isCorrect:
      unwrapBoolean(option?.isCorrect, "isCorrect") ||
      unwrapBoolean(option?.correct, "correct"),
  }));

  if (mappedType === "text") {
    return {
      id: questionId,
      type: "text",
      text:
        unwrapString(question?.text, "text") || `Вопрос ${questionIndex + 1}`,
      acceptedAnswers: options
        .filter((option) => option.isCorrect)
        .map((option) => option.label),
      trim: true,
      ignoreCase: true,
    };
  }

  return {
    id: questionId,
    type: mappedType,
    text:
      unwrapString(question?.text, "text") || `Вопрос ${questionIndex + 1}`,
    options: options.map((option) => ({
      id: option.id,
      label: option.label,
    })),
    correctOptionIds: options
      .filter((option) => option.isCorrect)
      .map((option) => option.id),
  };
}

function getSyllabusLessonLocation(syllabus, lessonId) {
  for (const module of syllabus?.modules ?? []) {
    const lesson = module.lessons.find((item) => item.lessonId === lessonId);

    if (lesson) {
      return { module, lesson };
    }
  }

  return {
    module: null,
    lesson: null,
  };
}

function mapBackendLesson({
  courseId,
  lessonId,
  module,
  lessonPreview,
  lessonResponse,
}) {
  const lessonType = normalizeText(lessonResponse?.type).toLowerCase();
  const lessonContent = normalizeObject(lessonResponse?.content);
  const assets = mapLessonAssets(lessonResponse?.assets);
  const title =
    unwrapString(lessonResponse?.title, "title") ||
    lessonPreview?.title ||
    "Урок без названия";

  if (lessonType === "coding") {
    const languages = normalizeArray(lessonContent?.languages);
    const primaryLanguage = normalizeObject(languages[0]);
    const testCases = normalizeArray(lessonContent?.testCases);

    return {
      id: lessonId,
      courseId,
      moduleId: module?.id ?? null,
      moduleTitle: module?.title ?? "Модуль курса",
      title,
      position: lessonPreview?.position ?? 1,
      type: "code",
      points: Math.max(testCases.length, 1),
      contentMarkdown:
        unwrapString(lessonContent?.taskMarkdown, "taskMarkdown") ||
        "Задание пока не заполнено.",
      assets,
      grader: {
        language:
          unwrapString(primaryLanguage?.language, "language") || "code",
        starterCode:
          unwrapString(primaryLanguage?.starterCode, "starterCode") || "",
        visibleCases: testCases
          .filter((testCase) => unwrapBoolean(testCase?.isPublic, "isPublic"))
          .map((testCase, index) => ({
            id:
              normalizeText(testCase?.id) ||
              `${lessonId}-visible-case-${index + 1}`,
            input: unwrapString(testCase?.input, "input"),
            expectedOutput: unwrapString(
              testCase?.expectedOutput,
              "expectedOutput",
            ),
          })),
        hiddenCases: testCases
          .filter((testCase) => !unwrapBoolean(testCase?.isPublic, "isPublic"))
          .map((testCase, index) => ({
            id:
              normalizeText(testCase?.id) ||
              `${lessonId}-hidden-case-${index + 1}`,
            input: unwrapString(testCase?.input, "input"),
            expectedOutput: unwrapString(
              testCase?.expectedOutput,
              "expectedOutput",
            ),
          })),
        mockExecution: {
          strategy: "contains",
          requiredSnippets: [],
        },
      },
      isBackendLesson: true,
    };
  }

  if (lessonType === "quiz") {
    const questions = normalizeArray(lessonContent?.questions).map(
      mapQuizQuestion,
    );

    return {
      id: lessonId,
      courseId,
      moduleId: module?.id ?? null,
      moduleTitle: module?.title ?? "Модуль курса",
      title,
      position: lessonPreview?.position ?? 1,
      type: "quiz",
      points: Math.max(questions.length, 1),
      contentMarkdown:
        unwrapString(lessonContent?.introMarkdown, "introMarkdown") ||
        "Вопросы урока пока не заполнены.",
      assets,
      questions,
      isBackendLesson: true,
    };
  }

  return {
    id: lessonId,
    courseId,
    moduleId: module?.id ?? null,
    moduleTitle: module?.title ?? "Модуль курса",
    title,
    position: lessonPreview?.position ?? 1,
    type: "theory",
    points: 0,
    contentMarkdown:
      unwrapString(lessonContent?.markdown, "markdown") ||
      "Содержимое урока пока не заполнено.",
    assets,
    isBackendLesson: true,
  };
}

export function isUuid(value) {
  return UUID_PATTERN.test(normalizeText(value));
}

async function requestCourseServiceJson(pathname, requestCache) {
  const requestUrl = buildCourseServiceUrl(pathname).toString();
  const cachedRequest = requestCache.get(requestUrl);

  if (cachedRequest) {
    return cachedRequest;
  }

  const requestPromise = fetch(requestUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then(async (response) => {
      const responseBody = await readResponseBody(response);

      if (!response.ok) {
        throw new Error(extractErrorMessage(response, responseBody));
      }

      return responseBody;
    })
    .catch((error) => {
      requestCache.delete(requestUrl);
      throw error;
    });

  requestCache.set(requestUrl, requestPromise);

  return requestPromise;
}

export async function requestCourseById(courseId) {
  return requestCourseServiceJson(`/course/${courseId}`, courseRequestCache);
}

export async function requestLessonById(lessonId) {
  return requestCourseServiceJson(
    `/course/lesson/${lessonId}`,
    lessonRequestCache,
  );
}

export function mapReadCourseByIdResponseToCoursePageData(response, courseId) {
  const modules = sortByPosition(normalizeArray(response?.structure).map(mapModule));
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
      isReadOnlyCourse: false,
      isEnrolled: false,
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

export function mapReadLessonByIdResponseToLessonPageData({
  courseId,
  lessonId,
  courseResponse,
  lessonResponse,
}) {
  const responseCourseId = normalizeText(lessonResponse?.courseId);

  if (responseCourseId && responseCourseId !== courseId) {
    throw new Error("Этот урок не относится к выбранному курсу.");
  }

  const coursePageData = mapReadCourseByIdResponseToCoursePageData(
    courseResponse,
    courseId,
  );
  const { module, lesson: lessonPreview } = getSyllabusLessonLocation(
    coursePageData.syllabus,
    lessonId,
  );

  return {
    course: coursePageData.course,
    syllabus: coursePageData.syllabus,
    lesson: mapBackendLesson({
      courseId,
      lessonId,
      module,
      lessonPreview,
      lessonResponse,
    }),
  };
}
