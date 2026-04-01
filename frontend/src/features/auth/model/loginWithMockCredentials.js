import { mockAccounts } from "./mockAccounts";

export function loginWithMockCredentials({ email, password }) {
  const normalizedEmail = email?.trim().toLowerCase();

  const account = mockAccounts.find(
    (item) =>
      item.email.toLowerCase() === normalizedEmail &&
      item.password === password,
  );

  if (!account) {
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
