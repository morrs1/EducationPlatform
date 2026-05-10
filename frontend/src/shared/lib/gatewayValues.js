const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeInteger(value) {
  return Number.isFinite(value) ? value : null;
}

export function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
}

export function unwrapString(value, key) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object" && typeof value[key] === "string") {
    return value[key].trim();
  }

  return "";
}

export function unwrapInteger(value, key) {
  if (Number.isFinite(value)) {
    return value;
  }

  if (value && typeof value === "object" && Number.isFinite(value[key])) {
    return value[key];
  }

  return null;
}

export function unwrapBoolean(value, key) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value && typeof value === "object" && typeof value[key] === "boolean") {
    return value[key];
  }

  return false;
}

export function isUuid(value) {
  return UUID_PATTERN.test(normalizeText(value));
}

export function normalizeUuidResponse(responseBody) {
  const normalizedValue =
    typeof responseBody === "string"
      ? responseBody.trim()
      : normalizeText(responseBody?.id);

  if (!isUuid(normalizedValue)) {
    throw new Error("Не удалось завершить действие. Попробуйте позже.");
  }

  return normalizedValue;
}
