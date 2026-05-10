const AUTH_STATE_KEY = "authState";

let gatewayAccessToken = "";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function readPersistedGatewayAccessToken() {
  try {
    const raw = localStorage.getItem(AUTH_STATE_KEY);

    if (!raw) {
      return "";
    }

    const parsed = JSON.parse(raw);
    return normalizeText(parsed?.accessToken);
  } catch {
    return "";
  }
}

export function setGatewayAccessToken(token) {
  gatewayAccessToken = normalizeText(token);
}

export function readStoredGatewayAccessToken() {
  return gatewayAccessToken || readPersistedGatewayAccessToken();
}
