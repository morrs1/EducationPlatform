import { requestViewerDisplayProfileById } from "../../../shared/api/userServiceApi";
import {
  formatCourseTagLabel,
  sanitizeCourseDisplayLabel,
} from "../model/courseDisplayLabels";

const DEFAULT_COURSE_SERVICE_API_BASE_URL = "/api/course-service";
const COURSE_SERVICE_MEDIA_PROXY_PATH = "/api/course-service-media";
const USER_SERVICE_MEDIA_PROXY_PATH = "/api/user-service-media";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const courseRequestCache = new Map();
const lessonRequestCache = new Map();
const courseListRequestCache = new Map();
const authorCourseListRequestCache = new Map();
const courseSearchRequestCache = new Map();

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

function extractErrorMessage(response) {
  if (response.status === 404) {
    return "Данные не найдены.";
  }

  if (response.status === 401 || response.status === 403) {
    return "Для этого действия нужно войти в аккаунт.";
  }

  return "Не удалось выполнить действие. Попробуйте позже.";
}

function normalizeUuidResponse(responseBody) {
  const normalizedValue =
    typeof responseBody === "string"
      ? responseBody.trim()
      : normalizeText(responseBody?.id);

  if (!isUuid(normalizedValue)) {
    throw new Error("Не удалось завершить действие. Попробуйте позже.");
  }

  return normalizedValue;
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
    buildCourseServiceUrl(`/course/${normalizedCourseId}`).toString(),
  );
}

function invalidateCourseListCache() {
  courseListRequestCache.delete(buildCourseServiceUrl("/course").toString());
}

function invalidateAuthorCourseListCache(authorId) {
  const normalizedAuthorId = normalizeText(authorId);

  if (!normalizedAuthorId) {
    authorCourseListRequestCache.clear();
    return;
  }

  authorCourseListRequestCache.delete(
    buildCourseServiceUrl(
      `/course/by-author/${normalizedAuthorId}/published`,
    ).toString(),
  );
  authorCourseListRequestCache.delete(
    buildCourseServiceUrl(
      `/course/by-author/${normalizedAuthorId}/drafts`,
    ).toString(),
  );
}

function invalidateLessonCache(lessonId) {
  const normalizedLessonId = normalizeText(lessonId);

  if (!normalizedLessonId) {
    return;
  }

  lessonRequestCache.delete(
    buildCourseServiceUrl(`/course/lesson/${normalizedLessonId}`).toString(),
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

function appendCacheKey(url, cacheKey) {
  const normalizedUrl = normalizeText(url);
  const normalizedCacheKey = normalizeText(cacheKey);

  if (!normalizedUrl || !normalizedCacheKey) {
    return normalizedUrl;
  }

  const separator = normalizedUrl.includes("?") ? "&" : "?";

  return `${normalizedUrl}${separator}v=${encodeURIComponent(normalizedCacheKey)}`;
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

function parseStorageReference(value) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return null;
  }

  try {
    const parsedUrl = new URL(normalizedValue, window.location.origin);

    if (parsedUrl.pathname.startsWith(USER_SERVICE_MEDIA_PROXY_PATH)) {
      return null;
    }

    if (parsedUrl.protocol === "s3:") {
      const key = parsedUrl.pathname.split("/").filter(Boolean).join("/");

      if (!parsedUrl.hostname || !key) {
        return null;
      }

      return {
        bucket: parsedUrl.hostname,
        key,
      };
    }

    const isLocalStorageHost =
      parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1";

    if (!isLocalStorageHost) {
      return null;
    }

    const pathSegments = parsedUrl.pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));

    if (pathSegments[0] === "buckets" && pathSegments.length >= 3) {
      return {
        bucket: pathSegments[1],
        key: pathSegments.slice(2).join("/"),
      };
    }

    if (pathSegments.length >= 2) {
      return {
        bucket: pathSegments[0],
        key: pathSegments.slice(1).join("/"),
      };
    }

    return null;
  } catch {
    return null;
  }
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

function normalizeLessonBackendType(type) {
  const normalizedType = normalizeText(type).toLowerCase();

  if (normalizedType === "coding" || normalizedType === "code") {
    return "coding";
  }

  if (normalizedType === "quiz") {
    return "quiz";
  }

  return "theory";
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

function resolveLessonAssetUrl(publicUrl, storageKey, createdAt = "") {
  const normalizedStorageKey = normalizeText(storageKey);
  const storageReference = parseStorageReference(publicUrl);
  const normalizedCreatedAt = normalizeText(createdAt);

  if (normalizedStorageKey) {
    const courseProxyUrl = buildCourseServiceMediaProxyUrl(normalizedStorageKey);
    const bucketProxyUrl = storageReference?.bucket
      ? buildBucketMediaProxyUrl(storageReference.bucket, normalizedStorageKey)
      : "";

    if (courseProxyUrl) {
      return appendCacheKey(
        courseProxyUrl,
        normalizedCreatedAt || normalizedStorageKey,
      );
    }

    if (bucketProxyUrl) {
      return appendCacheKey(
        bucketProxyUrl,
        normalizedCreatedAt || normalizedStorageKey,
      );
    }
  }

  const normalizedPublicUrl = normalizeDirectAssetUrl(publicUrl);

  if (normalizedPublicUrl && !isPlaceholderAssetUrl(normalizedPublicUrl)) {
    return appendCacheKey(
      normalizedPublicUrl,
      normalizedCreatedAt || normalizedStorageKey,
    );
  }

  return normalizedPublicUrl;
}

function mapLessonAsset(asset, assetIndex) {
  const mimeType = unwrapString(asset?.mimeType, "mimeType");
  const assetType = normalizeText(
    unwrapString(asset?.type, "assetType") ||
      unwrapString(asset?.assetType, "assetType"),
  ).toLowerCase();
  const type = normalizeLessonAssetType(
    assetType,
    mimeType,
  );
  const storageKey = unwrapString(asset?.storageKey, "storageKey");
  const publicUrl = unwrapString(asset?.publicUrl, "publicUrl");
  const originalFilename = unwrapString(
    asset?.originalFilename,
    "originalFilename",
  );
  const createdAt = normalizeText(asset?.createdAt);
  const resolvedUrl = resolveLessonAssetUrl(publicUrl, storageKey, createdAt);

  return {
    id: normalizeText(asset?.id) || `backend-asset-${assetIndex + 1}`,
    type,
    assetType: assetType || type,
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
    createdAt,
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

function buildCourseEyebrow(tags, difficulty) {
  const primaryTag =
    formatCourseTagLabel(tags?.[0]) || sanitizeCourseDisplayLabel("");
  const parts = [formatDifficultyLabel(difficulty)];

  return {
    categoryName: primaryTag,
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

function mapQuizEditorQuestion(question, questionIndex) {
  const mappedType = mapBackendQuestionType(question?.type);
  const questionId =
    normalizeText(question?.id) || crypto.randomUUID();
  const options = normalizeArray(question?.options).map((option, optionIndex) => ({
    id: normalizeText(option?.id) || crypto.randomUUID(),
    text: unwrapString(option?.text, "text") || `Вариант ${optionIndex + 1}`,
    isCorrect:
      unwrapBoolean(option?.isCorrect, "isCorrect") ||
      unwrapBoolean(option?.correct, "correct"),
  }));

  return {
    id: questionId,
    type:
      mappedType === "multiple_choice" ? "multiple_choice" : "single_choice",
    text:
      unwrapString(question?.text, "text") || `Вопрос ${questionIndex + 1}`,
    options: options.length
      ? options
      : [
          {
            id: crypto.randomUUID(),
            text: "Вариант 1",
            isCorrect: true,
          },
          {
            id: crypto.randomUUID(),
            text: "Вариант 2",
            isCorrect: false,
          },
        ],
  };
}

function selectLessonCoverAsset(assets) {
  const coverAssets = assets.filter((asset) => asset.assetType === "cover");

  if (coverAssets.length) {
    return [...coverAssets].sort((left, right) =>
      normalizeText(right.createdAt).localeCompare(normalizeText(left.createdAt)),
    )[0];
  }

  return null;
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
  const coverAsset = selectLessonCoverAsset(assets);
  const lessonAssets = assets.filter((asset) => asset.assetType !== "cover");
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
      coverAsset,
      assets: lessonAssets,
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
      coverAsset,
      assets: lessonAssets,
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
    coverAsset,
    assets: lessonAssets,
    isBackendLesson: true,
  };
}

export function isUuid(value) {
  return UUID_PATTERN.test(normalizeText(value));
}

/**
 * Подставляет ФИО автора из user service по course.authorId (в ответе course-service есть только id).
 */
export async function enrichCoursePageDataWithAuthorName(pageData) {
  if (!pageData?.course) {
    return pageData;
  }

  const authorId = normalizeText(pageData.course.authorId);
  const existingName = normalizeText(pageData.course.authorName);

  if (existingName) {
    return pageData;
  }

  if (!authorId || !isUuid(authorId)) {
    return pageData;
  }

  try {
    const authorProfile = await requestViewerDisplayProfileById(authorId);
    const name = normalizeText(authorProfile?.name);

    if (!name) {
      return pageData;
    }

    return {
      ...pageData,
      course: {
        ...pageData.course,
        authorName: name,
      },
    };
  } catch {
    return pageData;
  }
}

async function requestCourseService(pathname, options = {}) {
  const requestUrl = buildCourseServiceUrl(pathname).toString();
  const response = await fetch(requestUrl, options);
  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    const error = new Error(extractErrorMessage(response));
    error.status = response.status;
    error.responseBody = responseBody;
    throw error;
  }

  return responseBody;
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
        const error = new Error(extractErrorMessage(response));
        error.status = response.status;
        error.responseBody = responseBody;
        throw error;
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

export async function requestAllCourses() {
  const responseBody = await requestCourseServiceJson(
    "/course",
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
    `/course/search?q=${encodeURIComponent(normalizedQuery)}`,
    courseSearchRequestCache,
  );

  return normalizeArray(responseBody);
}

export async function requestPublishedCoursesByAuthor(authorId) {
  const normalizedAuthorId = normalizeText(authorId);
  const responseBody = await requestCourseServiceJson(
    `/course/by-author/${normalizedAuthorId}/published`,
    authorCourseListRequestCache,
  );

  return normalizeArray(responseBody);
}

export async function requestDraftCoursesByAuthor(authorId) {
  const normalizedAuthorId = normalizeText(authorId);
  const responseBody = await requestCourseServiceJson(
    `/course/by-author/${normalizedAuthorId}/drafts`,
    authorCourseListRequestCache,
  );

  return normalizeArray(responseBody);
}

export async function requestLessonById(lessonId) {
  return requestCourseServiceJson(
    `/course/lesson/${lessonId}`,
    lessonRequestCache,
  );
}

export async function requestCourseCreation(payload) {
  const responseBody = await requestCourseService("/course", {
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
    `/course/${normalizedCourseId}/module`,
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
  const responseBody = await requestCourseService("/course/lesson", {
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

  await requestCourseService(`/course/${normalizedCourseId}/publish`, {
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
    `/course/lesson/${normalizedLessonId}`,
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

  formData.append("file", file);
  formData.append(
    "request",
    new Blob(
      [
        JSON.stringify({
          title,
          assetType,
        }),
      ],
      {
        type: "application/json",
      },
    ),
  );

  const responseBody = await requestCourseService(
    `/course/lesson/${normalizedLessonId}/asset`,
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

export function extractLessonCoverAssetFromLessonResponse(lessonResponse) {
  const assets = mapLessonAssets(lessonResponse?.assets);

  return selectLessonCoverAsset(assets);
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

export function mapReadLessonByIdResponseToLessonEditorData({
  courseId,
  lessonId,
  module,
  lessonPreview,
  lessonResponse,
}) {
  const lessonContent = normalizeObject(lessonResponse?.content);
  const type = normalizeLessonBackendType(
    normalizeText(lessonResponse?.type) || lessonPreview?.type,
  );
  const assets = mapLessonAssets(lessonResponse?.assets);
  const coverAsset = selectLessonCoverAsset(assets);

  return {
    id: lessonId,
    courseId,
    moduleId: module?.id ?? null,
    moduleTitle: module?.title ?? "Модуль курса",
    title:
      unwrapString(lessonResponse?.title, "title") ||
      lessonPreview?.title ||
      "Урок без названия",
    type,
    position: lessonPreview?.position ?? 1,
    estimatedMinutes: lessonPreview?.estimatedMinutes ?? null,
    durationLabel:
      lessonPreview?.durationLabel ||
      formatMinutesLabel(lessonPreview?.estimatedMinutes),
    isPreview: Boolean(lessonPreview?.isPreview),
    updatedAt: normalizeText(lessonResponse?.updatedAt),
    createdAt: normalizeText(lessonResponse?.createdAt),
    coverAsset,
    assets: assets.filter((asset) => asset.assetType !== "cover"),
    contentMarkdown:
      type === "quiz"
        ? unwrapString(lessonContent?.introMarkdown, "introMarkdown")
        : type === "coding"
          ? unwrapString(lessonContent?.taskMarkdown, "taskMarkdown")
          : unwrapString(lessonContent?.markdown, "markdown"),
    questions:
      type === "quiz"
        ? normalizeArray(lessonContent?.questions).map(mapQuizEditorQuestion)
        : [],
    coding:
      type === "coding"
        ? {
            checkerType:
              unwrapString(lessonContent?.checkerType, "checkerType") ||
              "stdin_stdout",
            languages: normalizeArray(lessonContent?.languages).map((language) => ({
              language: unwrapString(language?.language, "language") || "java",
              starterCode:
                unwrapString(language?.starterCode, "starterCode") || "",
            })),
            testCases: normalizeArray(lessonContent?.testCases).map(
              (testCase, testCaseIndex) => ({
                id: normalizeText(testCase?.id) || crypto.randomUUID(),
                isPublic: unwrapBoolean(testCase?.isPublic, "isPublic"),
                input: unwrapString(testCase?.input, "input"),
                expectedOutput: unwrapString(
                  testCase?.expectedOutput,
                  "expectedOutput",
                ),
                title: `Тест ${testCaseIndex + 1}`,
              }),
            ),
          }
        : null,
  };
}
