function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Подпись тега курса для UI: только нормализация строки, без подмены
 * «frontend» / «backend» и т.д. (это остаётся в {@link sanitizeCourseDisplayLabel} для старых категорий).
 */
export function formatCourseTagLabel(value) {
  if (value == null) {
    return "";
  }

  const text = typeof value === "string" ? value : String(value);
  return text.trim();
}

export function sanitizeCourseDisplayLabel(value, fallback = "Курс") {
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
