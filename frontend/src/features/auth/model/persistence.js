import { mockAccounts } from "./mockAccounts";

const ACCOUNTS_STORAGE_KEY = "accountsByViewerId";

function normalizeText(value, { lowercase = false } = {}) {
  if (typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.trim();

  return lowercase ? normalizedValue.toLowerCase() : normalizedValue;
}

export function normalizeAccountRecord(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const viewerId = normalizeText(value.viewerId);
  const email = normalizeText(value.email, { lowercase: true });
  const password = normalizeText(value.password);

  if (!viewerId || !email || !password) {
    return null;
  }

  return {
    id: normalizeText(value.id) || `account-${viewerId}`,
    viewerId,
    email,
    password,
  };
}

export function createDefaultAccountsMap() {
  return mockAccounts.reduce((accountsMap, account) => {
    const normalizedAccount = normalizeAccountRecord(account);

    if (normalizedAccount) {
      accountsMap[normalizedAccount.viewerId] = normalizedAccount;
    }

    return accountsMap;
  }, {});
}

function normalizeAccountsMapValue(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.values(value).reduce((accountsMap, account) => {
    const normalizedAccount = normalizeAccountRecord(account);

    if (normalizedAccount) {
      accountsMap[normalizedAccount.viewerId] = normalizedAccount;
    }

    return accountsMap;
  }, {});
}

export function loadAccountsMap() {
  try {
    const savedValue = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    const parsedValue = savedValue ? JSON.parse(savedValue) : null;

    return {
      ...createDefaultAccountsMap(),
      ...normalizeAccountsMapValue(parsedValue),
    };
  } catch {
    return createDefaultAccountsMap();
  }
}

export function saveAccountsMap(accountsMap) {
  localStorage.setItem(
    ACCOUNTS_STORAGE_KEY,
    JSON.stringify(normalizeAccountsMapValue(accountsMap)),
  );
}

export function getPrimaryAccount(accountsMap = loadAccountsMap()) {
  return Object.values(accountsMap)[0] ?? null;
}

export function getAccountByViewerId(
  viewerId,
  accountsMap = loadAccountsMap(),
) {
  return viewerId ? accountsMap[viewerId] ?? null : null;
}

export function findAccountByEmail(email, accountsMap = loadAccountsMap()) {
  const normalizedEmail = normalizeText(email, { lowercase: true });

  if (!normalizedEmail) {
    return null;
  }

  return (
    Object.values(accountsMap).find((account) => account.email === normalizedEmail) ??
    null
  );
}

export function upsertAccount(account) {
  const normalizedAccount = normalizeAccountRecord(account);

  if (!normalizedAccount) {
    return null;
  }

  const accountsMap = loadAccountsMap();
  accountsMap[normalizedAccount.viewerId] = normalizedAccount;
  saveAccountsMap(accountsMap);

  return normalizedAccount;
}
