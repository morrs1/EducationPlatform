import { findAccountByEmail } from "./persistence";

export function loginWithMockCredentials({
  email,
  password,
  accountEmail = "",
  accountPassword = "",
  viewerId = null,
}) {
  const normalizedEmail = email?.trim().toLowerCase();
  const account =
    (accountEmail && accountPassword && viewerId
      ? {
          email: accountEmail.trim().toLowerCase(),
          password: accountPassword,
          viewerId,
        }
      : findAccountByEmail(normalizedEmail)) ?? null;

  if (!account || normalizedEmail !== account.email || password !== account.password) {
    return {
      ok: false,
      error: "Неверная почта или пароль",
    };
  }

  return {
    ok: true,
    viewerId: account.viewerId,
  };
}
