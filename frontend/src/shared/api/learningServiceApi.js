const DEFAULT_LEARNING_SERVICE_API_BASE_URL = "/api/learning";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function isUuid(value) {
  return UUID_PATTERN.test(normalizeText(value));
}

function normalizeUuid(value, fieldName) {
  const normalizedValue = normalizeText(value);

  if (!isUuid(normalizedValue)) {
    throw new Error(`${fieldName} должен быть UUID.`);
  }

  return normalizedValue;
}

function normalizeDateTime(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  return normalizeText(value) || null;
}

function getLearningServiceApiBaseUrl() {
  const configuredBaseUrl = normalizeText(
    import.meta.env.VITE_LEARNING_SERVICE_API_BASE_URL,
  );

  return configuredBaseUrl || DEFAULT_LEARNING_SERVICE_API_BASE_URL;
}

function buildLearningServiceUrl(pathname = "") {
  return new URL(
    `${getLearningServiceApiBaseUrl()}${pathname}`,
    window.location.origin,
  );
}

async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => "");
}

function extractErrorMessage(response, context = "") {
  if (response.status === 404) {
    return "Данные не найдены.";
  }

  if (response.status === 401 || response.status === 403) {
    return "Для этого действия нужно войти в аккаунт.";
  }

  return context
    ? "Не удалось выполнить действие. Попробуйте позже."
    : "Не удалось получить данные. Попробуйте позже.";
}

async function requestLearningService(pathname, options = {}, context = "") {
  const response = await fetch(buildLearningServiceUrl(pathname).toString(), {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
  });
  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    const error = new Error(extractErrorMessage(response, context));
    error.status = response.status;
    error.responseBody = responseBody;
    throw error;
  }

  return responseBody;
}

function appendQuery(pathname, params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const normalizedValue = normalizeText(value);

    if (normalizedValue) {
      searchParams.set(key, normalizedValue);
    }
  });

  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function normalizeCourseIdsResponse(responseBody) {
  return Array.isArray(responseBody?.courses)
    ? responseBody.courses.filter(isUuid)
    : [];
}

export async function requestEnrollUserInCourse({ userId, courseId }) {
  return requestLearningService(
    "/enrollment",
    {
      method: "POST",
      body: JSON.stringify({
        userId: normalizeUuid(userId, "userId"),
        courseId: normalizeUuid(courseId, "courseId"),
      }),
    },
    "enrolling user in course",
  );
}

export async function requestLeaveCourse({ userId, courseId }) {
  return requestLearningService(
    "/enrollment/leave",
    {
      method: "POST",
      body: JSON.stringify({
        userId: normalizeUuid(userId, "userId"),
        courseId: normalizeUuid(courseId, "courseId"),
      }),
    },
    "leaving course",
  );
}

export async function requestIncompleteCoursesByUser(userId) {
  const responseBody = await requestLearningService(
    appendQuery("/enrollment/courses/by-user/incomplete", {
      userId: normalizeUuid(userId, "userId"),
    }),
    {},
    "loading incomplete courses",
  );

  return normalizeCourseIdsResponse(responseBody);
}

export async function requestCompletedCoursesByUser(userId) {
  const responseBody = await requestLearningService(
    appendQuery("/enrollment/courses/by-user/completed", {
      userId: normalizeUuid(userId, "userId"),
    }),
    {},
    "loading completed courses",
  );

  return normalizeCourseIdsResponse(responseBody);
}

export async function requestCompletedLessonsForCourse({ userId, courseId }) {
  const responseBody = await requestLearningService(
    appendQuery("/enrollment/completed-lessons", {
      userId: normalizeUuid(userId, "userId"),
      courseId: normalizeUuid(courseId, "courseId"),
    }),
    {},
    "loading completed lessons",
  );

  return {
    enrollmentId: normalizeText(responseBody?.enrollmentId),
    enrollmentStatus: normalizeText(responseBody?.enrollmentStatus),
    completedLessons: Array.isArray(responseBody?.completedLessons)
      ? responseBody.completedLessons
          .map((lesson) => ({
            lessonId: normalizeText(lesson?.lessonId),
            completedAt: normalizeText(lesson?.completedAt),
          }))
          .filter((lesson) => isUuid(lesson.lessonId))
      : [],
  };
}

export async function requestCompleteLesson({
  userId,
  courseId,
  lessonId,
  completedAt = null,
}) {
  return requestLearningService(
    "/enrollment/complete-lesson",
    {
      method: "POST",
      body: JSON.stringify({
        userId: normalizeUuid(userId, "userId"),
        courseId: normalizeUuid(courseId, "courseId"),
        lessonId: normalizeUuid(lessonId, "lessonId"),
        completedAt: normalizeDateTime(completedAt),
      }),
    },
    "completing lesson",
  );
}

export async function requestCompleteCourse({
  userId,
  courseId,
  completedAt = null,
}) {
  return requestLearningService(
    "/enrollment/complete-course",
    {
      method: "POST",
      body: JSON.stringify({
        userId: normalizeUuid(userId, "userId"),
        courseId: normalizeUuid(courseId, "courseId"),
        completedAt: normalizeDateTime(completedAt),
      }),
    },
    "completing course",
  );
}

export async function requestLearningActivityYear({ userId, year }) {
  return requestLearningService(
    appendQuery("/activity/year", {
      userId: normalizeUuid(userId, "userId"),
      year: String(year),
    }),
    {},
    "loading activity year",
  );
}

function normalizeCertificateRecord(row) {
  const id = normalizeText(row?.id);

  if (!isUuid(id)) {
    return null;
  }

  const courseId = normalizeText(row?.courseId);

  if (!isUuid(courseId)) {
    return null;
  }

  return {
    id,
    enrollmentId: normalizeText(row?.enrollmentId),
    userId: normalizeText(row?.userId),
    courseId,
    issuedAt: normalizeText(row?.issuedAt),
    serialNo: normalizeText(row?.serialNo) || "",
    fileUrl: normalizeText(row?.fileUrl) || "",
  };
}

export async function requestCertificatesByUser(userId) {
  const responseBody = await requestLearningService(
    `/certificate/by-user/${normalizeUuid(userId, "userId")}`,
    {},
    "loading certificates",
  );

  if (!Array.isArray(responseBody)) {
    return [];
  }

  return responseBody
    .map(normalizeCertificateRecord)
    .filter(Boolean);
}

export async function requestCreateCertificate({
  enrollmentId,
  issuedAt = null,
  serialNo = "",
}) {
  return requestLearningService(
    "/certificate",
    {
      method: "POST",
      body: JSON.stringify({
        enrollmentId: normalizeUuid(enrollmentId, "enrollmentId"),
        issuedAt: normalizeDateTime(issuedAt),
        serialNo: normalizeText(serialNo) || null,
      }),
    },
    "creating certificate",
  );
}

export async function requestCertificateById(certificateId) {
  return requestLearningService(
    `/certificate/${normalizeUuid(certificateId, "certificateId")}`,
    {},
    "loading certificate",
  );
}
