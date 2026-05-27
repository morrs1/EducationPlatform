function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getFirstString(values) {
  return values.find((value) => typeof value === "string" && value.trim()) ?? "";
}

function hasCyrillic(value) {
  return /[А-Яа-яЁё]/.test(value);
}

function getFieldLabel(field) {
  const normalizedField = normalizeText(field).split(".").at(-1);
  const labels = {
    accessToken: "токен доступа",
    assetType: "тип файла",
    conversation_id: "диалог",
    courseId: "курс",
    email: "почта",
    file: "файл",
    lesson_id: "урок",
    lessonId: "урок",
    message_id: "сообщение",
    name: "имя",
    password: "пароль",
    question: "вопрос",
    status: "статус",
    title: "название",
    user_id: "пользователь",
    userId: "пользователь",
  };

  return labels[normalizedField] ?? "поле";
}

function extractFastApiValidationMessage(detail) {
  if (!Array.isArray(detail)) {
    return "";
  }

  const messages = detail
    .map((item) => {
      const field = Array.isArray(item?.loc)
        ? item.loc.filter((part) => part !== "body").join(".")
        : "";
      const message = normalizeText(item?.msg);

      if (!message) {
        return "";
      }

      const fieldLabel = getFieldLabel(field);

      if (message.toLowerCase().includes("field required")) {
        return `Заполните поле "${fieldLabel}".`;
      }

      if (message.toLowerCase().includes("valid uuid")) {
        return `Поле "${fieldLabel}" должно быть корректным UUID.`;
      }

      return field
        ? `Проверьте поле "${fieldLabel}".`
        : "Проверьте введенные данные.";
    })
    .filter(Boolean);

  return messages.join("; ");
}

function extractBackendMessage(responseBody) {
  if (typeof responseBody === "string") {
    return normalizeText(responseBody);
  }

  if (!responseBody || typeof responseBody !== "object") {
    return "";
  }

  const validationMessage = extractFastApiValidationMessage(responseBody.detail);

  return getFirstString([
    responseBody.message,
    responseBody.error,
    responseBody.detail,
    responseBody.title,
    responseBody.msg,
    validationMessage,
  ]);
}

function translateBackendMessage(message) {
  const normalizedMessage = normalizeText(message);
  const lowerMessage = normalizedMessage.toLowerCase();

  if (!normalizedMessage) {
    return "";
  }

  if (
    lowerMessage.includes("bad credentials") ||
    lowerMessage.includes("invalid credentials") ||
    lowerMessage.includes("invalid email or password") ||
    lowerMessage.includes("wrong email or password")
  ) {
    return "Неверная почта или пароль.";
  }

  if (lowerMessage.includes("name length must be between 2 and 50")) {
    return "Имя должно быть от 2 до 50 символов.";
  }

  if (lowerMessage.includes("surname length must be between 2 and 50")) {
    return "Фамилия должна быть от 2 до 50 символов.";
  }

  if (lowerMessage.includes("patronymic length must be between 2 and 50")) {
    return "Отчество должно быть от 2 до 50 символов.";
  }

  if (
    lowerMessage.includes("name must not be blank") ||
    lowerMessage.includes("name must not be null")
  ) {
    return "Введите имя.";
  }

  if (
    lowerMessage.includes("surname must not be blank") ||
    lowerMessage.includes("surname must not be null")
  ) {
    return "Введите фамилию.";
  }

  if (
    lowerMessage.includes("patronymic must not be blank") ||
    lowerMessage.includes("patronymic must not be null")
  ) {
    return "Введите отчество.";
  }

  if (lowerMessage.includes("name contains invalid characters")) {
    return "Имя может содержать только буквы, пробел, дефис и апостроф.";
  }

  if (lowerMessage.includes("surname contains invalid characters")) {
    return "Фамилия может содержать только буквы, пробел, дефис и апостроф.";
  }

  if (lowerMessage.includes("patronymic contains invalid characters")) {
    return "Отчество может содержать только буквы, пробел, дефис и апостроф.";
  }

  if (
    lowerMessage.includes("already exists") ||
    lowerMessage.includes("duplicate") ||
    lowerMessage.includes("unique constraint") ||
    lowerMessage.includes("already registered")
  ) {
    return "Такая запись уже существует.";
  }

  if (
    lowerMessage.includes("user was not found") ||
    lowerMessage.includes("user not found")
  ) {
    return "Пользователь не найден.";
  }

  if (
    lowerMessage.includes("course not found") ||
    lowerMessage.includes("lesson not found") ||
    lowerMessage.includes("not found")
  ) {
    return "Данные не найдены.";
  }

  if (lowerMessage.includes("lesson already completed")) {
    return "Урок уже отмечен как завершенный.";
  }

  if (
    lowerMessage.includes("unsupported file extension") ||
    lowerMessage.includes("file extension is missing") ||
    lowerMessage.includes("unsupported media type")
  ) {
    return "Формат файла не поддерживается.";
  }

  if (
    lowerMessage.includes("maximum upload size") ||
    lowerMessage.includes("payload too large") ||
    lowerMessage.includes("request entity too large")
  ) {
    return "Файл слишком большой.";
  }

  if (
    lowerMessage.includes("failed to fetch") ||
    lowerMessage.includes("networkerror") ||
    lowerMessage.includes("network error")
  ) {
    return "Нет соединения с сервером. Проверьте интернет или запущенные сервисы.";
  }

  if (
    lowerMessage.includes("must be uuid") ||
    lowerMessage.includes("valid uuid") ||
    lowerMessage.includes("должен быть uuid")
  ) {
    return "Не удалось определить нужные данные. Обновите страницу и попробуйте снова.";
  }

  if (hasCyrillic(normalizedMessage)) {
    return normalizedMessage;
  }

  if (/[a-z]/i.test(normalizedMessage)) {
    return "";
  }

  return normalizedMessage;
}

function getStatusMessage(status, { action = "", defaultMessage = "" } = {}) {
  if (status === 400) {
    return "Проверьте введенные данные.";
  }

  if (status === 401) {
    return "Войдите в аккаунт, чтобы продолжить.";
  }

  if (status === 403) {
    return "У вас нет прав для этого действия.";
  }

  if (status === 404) {
    return "Данные не найдены.";
  }

  if (status === 409) {
    return "Конфликт данных. Обновите страницу и попробуйте снова.";
  }

  if (status === 413) {
    return "Файл слишком большой.";
  }

  if (status === 415) {
    return "Формат файла не поддерживается.";
  }

  if (status === 422) {
    return "Проверьте введенные данные.";
  }

  if (status === 429) {
    return "Слишком много запросов. Попробуйте позже.";
  }

  if (status === 503) {
    return "Сервис временно недоступен. Попробуйте позже.";
  }

  if (status >= 500) {
    return "На сервере произошла ошибка. Попробуйте позже.";
  }

  return (
    defaultMessage ||
    (action
      ? "Не удалось выполнить действие. Попробуйте позже."
      : "Не удалось получить данные. Попробуйте позже.")
  );
}

export class ApiError extends Error {
  constructor(message, { status = 0, responseBody = null, context = "" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.responseBody = responseBody;
    this.context = context;
  }
}

export function createApiError(response, responseBody, options = {}) {
  const status = response?.status ?? 0;
  const backendMessage = translateBackendMessage(
    extractBackendMessage(responseBody),
  );
  const message =
    backendMessage ||
    options.defaultMessage ||
    getStatusMessage(status, {
      action: options.context,
    });

  return new ApiError(message, {
    status,
    responseBody,
    context: options.context,
  });
}

export function createNetworkApiError(error, options = {}) {
  return new ApiError(
    "Нет соединения с сервером. Проверьте интернет или запущенные сервисы.",
    {
      status: 0,
      responseBody: error ?? null,
      context: options.context,
    },
  );
}

export function getUserErrorMessage(error, fallbackMessage) {
  if (error instanceof Error && error.message) {
    return (
      translateBackendMessage(error.message) ||
      fallbackMessage ||
      "Не удалось выполнить действие. Попробуйте позже."
    );
  }

  if (typeof error === "string" && error.trim()) {
    return (
      translateBackendMessage(error) ||
      fallbackMessage ||
      "Не удалось выполнить действие. Попробуйте позже."
    );
  }

  return fallbackMessage || "Не удалось выполнить действие. Попробуйте позже.";
}
