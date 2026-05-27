const PERSON_NAME_PATTERN = /^\p{L}+(?:[ '-]\p{L}+)*$/u;
const PERSON_NAME_MIN_LENGTH = 2;
const PERSON_NAME_MAX_LENGTH = 50;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getLengthErrorMessage(label) {
  if (label === "Фамилия") {
    return `Фамилия должна быть от ${PERSON_NAME_MIN_LENGTH} до ${PERSON_NAME_MAX_LENGTH} символов.`;
  }

  return `${label} должно быть от ${PERSON_NAME_MIN_LENGTH} до ${PERSON_NAME_MAX_LENGTH} символов.`;
}

export function validatePersonNameField(value, label) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return `Введите ${label.toLowerCase()}.`;
  }

  if (
    normalizedValue.length < PERSON_NAME_MIN_LENGTH ||
    normalizedValue.length > PERSON_NAME_MAX_LENGTH
  ) {
    return getLengthErrorMessage(label);
  }

  if (!PERSON_NAME_PATTERN.test(normalizedValue)) {
    return `${label} может содержать только буквы, пробел, дефис и апостроф.`;
  }

  return "";
}

export function validateRequiredProfileNameParts({
  firstName,
  lastName,
  patronymic,
}) {
  return (
    validatePersonNameField(lastName, "Фамилия") ||
    validatePersonNameField(firstName, "Имя") ||
    validatePersonNameField(patronymic, "Отчество")
  );
}
