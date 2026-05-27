import { createApiError, createNetworkApiError } from "./apiErrors";

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

export async function requestGatewayLogin({ email, password }) {
  let response;

  try {
    response = await fetch(buildAuthUrl("/login").toString(), {
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
  } catch (error) {
    throw createNetworkApiError(error, { context: "вход в аккаунт" });
  }

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw createApiError(response, responseBody, {
      context: "вход в аккаунт",
      defaultMessage:
        response.status === 401 || response.status === 403
          ? "Неверная почта или пароль."
          : "Не удалось выполнить вход. Попробуйте позже.",
    });
  }

  return responseBody;
}

export async function requestGatewayRegister(payload) {
  let response;

  try {
    response = await fetch(buildAuthUrl("/register").toString(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw createNetworkApiError(error, { context: "регистрация" });
  }

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw createApiError(response, responseBody, {
      context: "регистрация",
      defaultMessage:
        response.status === 409
          ? "Пользователь с такой почтой уже существует."
          : "Не удалось зарегистрироваться. Попробуйте позже.",
    });
  }

  return responseBody;
}
