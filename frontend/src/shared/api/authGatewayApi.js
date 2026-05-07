const DEFAULT_AUTH_API_BASE_URL = "/auth";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getAuthApiBaseUrl() {
  const configured = normalizeText(import.meta.env.VITE_AUTH_API_BASE_URL);

  return configured || DEFAULT_AUTH_API_BASE_URL;
}

function buildAuthUrl(pathname) {
  const base = getAuthApiBaseUrl().replace(/\/$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return new URL(`${base}${path}`, window.location.origin);
}

async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => "");
}

function formatGatewayErrorMessage(response, responseBody) {
  if (typeof responseBody === "string" && responseBody.trim()) {
    return responseBody.trim();
  }

  if (responseBody && typeof responseBody === "object") {
    const message =
      responseBody.message ??
      responseBody.error ??
      responseBody.detail ??
      responseBody.title;

    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  if (response.status === 401 || response.status === 403) {
    return "Неверная почта или пароль.";
  }

  if (response.status === 409) {
    return "Пользователь с такой почтой уже существует.";
  }

  if (response.status >= 400) {
    return "Не удалось выполнить запрос. Попробуйте позже.";
  }

  return "Не удалось выполнить запрос. Попробуйте позже.";
}

export async function requestGatewayLogin({ email, password }) {
  const response = await fetch(buildAuthUrl("/login").toString(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: normalizeText(email).toLowerCase(),
      password: normalizeText(password),
    }),
  });

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(formatGatewayErrorMessage(response, responseBody));
  }

  return responseBody;
}

export async function requestGatewayRegister(payload) {
  const response = await fetch(buildAuthUrl("/register").toString(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(formatGatewayErrorMessage(response, responseBody));
  }

  return responseBody;
}
