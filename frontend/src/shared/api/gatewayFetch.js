import { readStoredGatewayAccessToken } from "./gatewayAuthSession";

function normalizePlainHeaders(headers) {
  if (!headers || typeof headers !== "object") {
    return {};
  }

  if (typeof headers.forEach === "function") {
    return Object.fromEntries(headers.entries());
  }

  return { ...headers };
}

export function buildGatewayAuthHeaders() {
  const token = readStoredGatewayAccessToken();

  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}

export function withGatewayAuth(options = {}) {
  const nextHeaders = {
    ...buildGatewayAuthHeaders(),
    ...normalizePlainHeaders(options.headers),
  };

  return {
    ...options,
    headers: nextHeaders,
  };
}
