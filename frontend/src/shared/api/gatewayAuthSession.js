const AUTH_STATE_KEY = "authState";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function readStoredGatewayAccessToken() {
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
