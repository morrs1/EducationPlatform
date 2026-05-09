import { withGatewayAuth } from "../../../shared/api";

const DEFAULT_ANSWER_SERVICE_API_BASE_URL = "/api/answer";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function isAnswerServiceUuid(value) {
  return UUID_PATTERN.test(normalizeText(value));
}

function normalizeUuid(value, fieldName) {
  const normalizedValue = normalizeText(value);

  if (!isAnswerServiceUuid(normalizedValue)) {
    throw new Error(`${fieldName} должен быть UUID.`);
  }

  return normalizedValue;
}

function getAnswerServiceApiBaseUrl() {
  const configuredBaseUrl = normalizeText(
    import.meta.env.VITE_ANSWER_SERVICE_API_BASE_URL,
  );

  return configuredBaseUrl || DEFAULT_ANSWER_SERVICE_API_BASE_URL;
}

function buildAnswerServiceUrl(pathname = "") {
  return new URL(
    `${getAnswerServiceApiBaseUrl()}${pathname}`,
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

function extractErrorMessage(response, responseBody) {
  const detail = normalizeText(responseBody?.detail);

  if (detail) {
    return detail;
  }

  if (response.status === 404) {
    return "Диалог ассистента не найден.";
  }

  if (response.status === 422) {
    return "Ассистент не смог обработать этот вопрос.";
  }

  if (response.status === 503) {
    return "Ассистент временно недоступен. Попробуйте позже.";
  }

  return "Не удалось получить ответ ассистента.";
}

async function requestAnswerService(pathname, options = {}) {
  const response = await fetch(
    buildAnswerServiceUrl(pathname).toString(),
    withGatewayAuth({
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers ?? {}),
      },
    }),
  );
  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    const error = new Error(extractErrorMessage(response, responseBody));
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

function mapConversationMessageResponse(message) {
  return {
    messageId: normalizeText(message?.message_id),
    question: normalizeText(message?.question),
    answer: typeof message?.answer === "string" ? message.answer : null,
    status: normalizeText(message?.status),
    createdAt: normalizeText(message?.created_at),
  };
}

function mapConversationResponse(response) {
  return {
    conversationId: normalizeText(response?.conversation_id),
    userId: normalizeText(response?.user_id),
    lessonId: normalizeText(response?.lesson_id),
    status: normalizeText(response?.status),
    messages: Array.isArray(response?.messages)
      ? response.messages.map(mapConversationMessageResponse)
      : [],
    createdAt: normalizeText(response?.created_at),
  };
}

function mapConversationListItemResponse(response) {
  return {
    conversationId: normalizeText(response?.conversation_id),
    userId: normalizeText(response?.user_id),
    lessonId: normalizeText(response?.lesson_id),
    status: normalizeText(response?.status),
    messagesCount: Number(response?.messages_count) || 0,
    createdAt: normalizeText(response?.created_at),
  };
}

export async function requestCreateAssistantConversation({ userId, lessonId }) {
  const responseBody = await requestAnswerService("/v1/conversations/", {
    method: "POST",
    body: JSON.stringify({
      user_id: normalizeUuid(userId, "user_id"),
      lesson_id: normalizeUuid(lessonId, "lesson_id"),
    }),
  });

  return {
    conversationId: normalizeUuid(
      responseBody?.conversation_id,
      "conversation_id",
    ),
  };
}

export async function requestAskAssistantQuestion({
  conversationId,
  question,
}) {
  const responseBody = await requestAnswerService(
    `/v1/conversations/${encodeURIComponent(
      normalizeUuid(conversationId, "conversation_id"),
    )}/ask`,
    {
      method: "POST",
      body: JSON.stringify({
        question: normalizeText(question),
      }),
    },
  );

  return {
    conversationId: normalizeUuid(
      responseBody?.conversation_id,
      "conversation_id",
    ),
    messageId: normalizeUuid(responseBody?.message_id, "message_id"),
    answerContent: normalizeText(responseBody?.answer_content),
    modelName: normalizeText(responseBody?.model_name),
    inputTokens: Number(responseBody?.input_tokens) || 0,
    outputTokens: Number(responseBody?.output_tokens) || 0,
  };
}

export async function requestAssistantConversation(conversationId) {
  const responseBody = await requestAnswerService(
    `/v1/conversations/${encodeURIComponent(
      normalizeUuid(conversationId, "conversation_id"),
    )}`,
  );

  return mapConversationResponse(responseBody);
}

export async function requestAssistantConversations({
  userId,
  limit = null,
  offset = null,
  sortingField = "created_at",
  sortingOrder = "DESC",
}) {
  const responseBody = await requestAnswerService(
    appendQuery("/v1/conversations/", {
      user_id: normalizeUuid(userId, "user_id"),
      limit,
      offset,
      sorting_field: sortingField,
      sorting_order: sortingOrder,
    }),
  );

  return Array.isArray(responseBody)
    ? responseBody.map(mapConversationListItemResponse)
    : [];
}

export async function requestCloseAssistantConversation(conversationId) {
  await requestAnswerService(
    `/v1/conversations/${encodeURIComponent(
      normalizeUuid(conversationId, "conversation_id"),
    )}/close`,
    {
      method: "PATCH",
    },
  );
}
