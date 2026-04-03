import { mockAccounts } from "./mockAccounts";

const fallbackAccount = mockAccounts[0] ?? null;

export function loginWithMockCredentials({
  email,
  password,
  accountEmail = fallbackAccount?.email ?? "",
  accountPassword = fallbackAccount?.password ?? "",
  viewerId = fallbackAccount?.viewerId ?? null,
}) {
  const normalizedEmail = email?.trim().toLowerCase();

  if (
    normalizedEmail !== accountEmail.toLowerCase() ||
    password !== accountPassword
  ) {
    return {
      ok: false,
      error: "Неверная почта или пароль",
    };
  }

  return {
    ok: true,
    viewerId,
  };
}
