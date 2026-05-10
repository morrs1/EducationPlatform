import { normalizeText } from "./courseServiceCommon";

export function normalizeLessonBackendType(type) {
  const normalizedType = normalizeText(type).toLowerCase();

  if (normalizedType === "coding" || normalizedType === "code") {
    return "coding";
  }

  if (normalizedType === "quiz") {
    return "quiz";
  }

  return "theory";
}

export function formatMinutesLabel(estimatedMinutes) {
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

export function sortByPosition(items) {
  return [...items].sort((left, right) => {
    const leftPosition = left?.position ?? 0;
    const rightPosition = right?.position ?? 0;

    return leftPosition - rightPosition;
  });
}

export function getSyllabusLessonLocation(syllabus, lessonId) {
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
