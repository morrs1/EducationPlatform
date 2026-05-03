const DEFAULT_LEARNING_SERVICE_API_BASE_URL = "/api/learning-service";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

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
    ? `learning_service returned ${response.status} while ${context}.`
    : `learning_service returned ${response.status}.`;
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
    throw new Error(extractErrorMessage(response, responseBody, context));
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
    "/learning/enrollment",
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

export async function requestIncompleteCoursesByUser(userId) {
  const responseBody = await requestLearningService(
    appendQuery("/learning/enrollment/courses/by-user/incomplete", {
      userId: normalizeUuid(userId, "userId"),
    }),
    {},
    "loading incomplete courses",
  );

  return normalizeCourseIdsResponse(responseBody);
}

export async function requestCompletedCoursesByUser(userId) {
  const responseBody = await requestLearningService(
    appendQuery("/learning/enrollment/courses/by-user/completed", {
      userId: normalizeUuid(userId, "userId"),
    }),
    {},
    "loading completed courses",
  );

  return normalizeCourseIdsResponse(responseBody);
}

export async function requestCompletedLessonsForCourse({ userId, courseId }) {
  const responseBody = await requestLearningService(
    appendQuery("/learning/enrollment/completed-lessons", {
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
    "/learning/enrollment/complete-lesson",
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
    "/learning/enrollment/complete-course",
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
    appendQuery("/learning/activity/year", {
      userId: normalizeUuid(userId, "userId"),
      year: String(year),
    }),
    {},
    "loading activity year",
  );
}

export async function requestCreateCertificate({
  enrollmentId,
  issuedAt = null,
  serialNo = "",
}) {
  return requestLearningService(
    "/learning/certificate",
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
    `/learning/certificate/${normalizeUuid(certificateId, "certificateId")}`,
    {},
    "loading certificate",
  );
}
