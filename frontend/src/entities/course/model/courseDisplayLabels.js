function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
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
