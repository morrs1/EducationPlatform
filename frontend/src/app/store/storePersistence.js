import {
  createInitialAuthState,
  getAccountByViewerId,
  getPrimaryAccount,
  loadAccountsMap,
  saveAccountsMap,
  upsertAccount,
} from "../../features/auth";
import {
  loadLessonSessionByViewerId,
  restoreLessonSession,
  saveLessonSessionByViewerId,
} from "../../features/lesson-session";
import { setGatewayAccessToken } from "../../shared/api/gatewayAuthSession";
import { restoreViewer } from "../../features/viewer";
import {
  createInitialViewerState,
  loadViewerProfileByViewerId,
  loadViewerProfilesMap,
  saveViewerProfile,
  saveViewerProfilesMap,
} from "../../entities/viewer";

function readStoredJson(key) {
  try {
    const savedValue = localStorage.getItem(key);

    return savedValue ? JSON.parse(savedValue) : null;
  } catch {
    return null;
  }
}

function normalizeSavedAuthSession(savedAuthState, legacySavedIsLogged) {
  return {
    isLogged: savedAuthState?.isLogged ?? legacySavedIsLogged === "true",
    currentViewerId: savedAuthState?.currentViewerId ?? null,
    accountViewerId: savedAuthState?.accountViewerId ?? null,
    accountEmail: savedAuthState?.accountEmail ?? "",
    accountPassword: savedAuthState?.accountPassword ?? "",
    accessToken: savedAuthState?.accessToken ?? "",
    userRole: savedAuthState?.userRole ?? "",
    userStatus: savedAuthState?.userStatus ?? "",
  };
}

function migrateLegacyAccountState(savedAuthSession, accountsMap) {
  const viewerId = savedAuthSession.accountViewerId?.trim();
  const email = savedAuthSession.accountEmail?.trim().toLowerCase();
  const password = savedAuthSession.accountPassword?.trim();

  if (!viewerId || !email || !password) {
    return {
      accountsMap,
      didMigrate: false,
    };
  }

  const existingAccount = accountsMap[viewerId];

  if (
    existingAccount?.email === email &&
    existingAccount.password === password
  ) {
    return {
      accountsMap,
      didMigrate: false,
    };
  }

  return {
    accountsMap: {
      ...accountsMap,
      [viewerId]: {
        id: existingAccount?.id ?? `account-${viewerId}`,
        viewerId,
        email,
        password,
      },
    },
    didMigrate: true,
  };
}

function migrateLegacyViewerState(
  savedViewerState,
  viewerProfilesMap,
  persistedViewerProfiles,
  viewerId,
  account,
) {
  const hasPersistedViewerProfile = Boolean(
    persistedViewerProfiles &&
    typeof persistedViewerProfiles === "object" &&
    !Array.isArray(persistedViewerProfiles) &&
    persistedViewerProfiles[viewerId],
  );

  if (!savedViewerState || !viewerId || hasPersistedViewerProfile) {
    return {
      viewerProfilesMap,
      didMigrate: false,
    };
  }

  return {
    viewerProfilesMap: {
      ...viewerProfilesMap,
      [viewerId]: {
        ...savedViewerState,
        id: viewerId,
        email: savedViewerState.email || account?.email || "",
      },
    },
    didMigrate: true,
  };
}

export function loadPreloadedState() {
  try {
    const savedAuth = readStoredJson("authState");
    const legacySavedIsLogged = localStorage.getItem("isLogged");
    const savedViewer = readStoredJson("viewerState");
    const persistedViewerProfiles = readStoredJson("viewerProfilesById");

    let accountsMap = loadAccountsMap();
    let viewerProfilesMap = loadViewerProfilesMap();
    const savedAuthSession = normalizeSavedAuthSession(
      savedAuth,
      legacySavedIsLogged,
    );

    const migratedAccounts = migrateLegacyAccountState(
      savedAuthSession,
      accountsMap,
    );
    accountsMap = migratedAccounts.accountsMap;

    if (migratedAccounts.didMigrate) {
      saveAccountsMap(accountsMap);
    }

    const primaryAccount = getPrimaryAccount(accountsMap);
    const persistedViewerId = savedAuthSession.isLogged
      ? (savedAuthSession.currentViewerId ??
        savedAuthSession.accountViewerId ??
        primaryAccount?.viewerId ??
        null)
      : null;
    const activeAccount =
      getAccountByViewerId(persistedViewerId, accountsMap) ??
      getAccountByViewerId(savedAuthSession.accountViewerId, accountsMap) ??
      primaryAccount;

    const migratedViewerProfiles = migrateLegacyViewerState(
      savedViewer,
      viewerProfilesMap,
      persistedViewerProfiles,
      persistedViewerId ?? activeAccount?.viewerId ?? null,
      activeAccount,
    );
    viewerProfilesMap = migratedViewerProfiles.viewerProfilesMap;

    if (migratedViewerProfiles.didMigrate) {
      saveViewerProfilesMap(viewerProfilesMap);
    }

    const authState = createInitialAuthState({
      savedSession: {
        ...savedAuthSession,
        currentViewerId: persistedViewerId,
      },
      fallbackAccount: primaryAccount,
      account: activeAccount,
    });

    setGatewayAccessToken(authState.accessToken);

    return {
      auth: authState,
      viewer: loadViewerProfileByViewerId(
        authState.currentViewerId,
        viewerProfilesMap,
      ),
      lessonSession: loadLessonSessionByViewerId(authState.currentViewerId),
    };
  } catch {
    const accountsMap = loadAccountsMap();
    const primaryAccount = getPrimaryAccount(accountsMap);

    const authState = createInitialAuthState({
      fallbackAccount: primaryAccount,
      account: primaryAccount,
    });

    setGatewayAccessToken(authState.accessToken);

    return {
      auth: authState,
      viewer: createInitialViewerState(),
      lessonSession: loadLessonSessionByViewerId(null),
    };
  }
}

function persistAuthState(authState) {
  setGatewayAccessToken(authState.accessToken);
  localStorage.setItem(
    "authState",
    JSON.stringify({
      isLogged: authState.isLogged,
      currentViewerId: authState.currentViewerId,
      accountViewerId: authState.accountViewerId,
      accountEmail: authState.accountEmail,
      accountPassword: authState.accountPassword,
      accessToken: authState.accessToken,
      userRole: authState.userRole,
      userStatus: authState.userStatus,
    }),
  );
}

function persistCurrentAccount(authState) {
  if (
    !authState.accountViewerId ||
    !authState.accountEmail ||
    !authState.accountPassword
  ) {
    return;
  }

  const existingAccount = getAccountByViewerId(authState.accountViewerId);

  upsertAccount({
    id: existingAccount?.id ?? `account-${authState.accountViewerId}`,
    viewerId: authState.accountViewerId,
    email: authState.accountEmail,
    password: authState.accountPassword,
  });
}

function persistViewerState(viewerId, state) {
  if (!viewerId) {
    return;
  }

  saveViewerProfile({
    ...state.viewer,
    id: viewerId,
    email: state.viewer.email || state.auth.accountEmail,
  });
  saveLessonSessionByViewerId(viewerId, state.lessonSession);
}

export function attachStorePersistence(store) {
  setGatewayAccessToken(store.getState().auth.accessToken);

  let activeViewerId = store.getState().auth.currentViewerId;
  let isRestoringUserState = false;

  store.subscribe(() => {
    try {
      const state = store.getState();
      const nextViewerId = state.auth.currentViewerId;

      persistAuthState(state.auth);
      persistCurrentAccount(state.auth);

      if (!isRestoringUserState && nextViewerId !== activeViewerId) {
        persistViewerState(activeViewerId, state);

        activeViewerId = nextViewerId;
        isRestoringUserState = true;
        store.dispatch(restoreViewer(loadViewerProfileByViewerId(nextViewerId)));
        store.dispatch(
          restoreLessonSession(loadLessonSessionByViewerId(nextViewerId)),
        );
        isRestoringUserState = false;
        return;
      }

      persistViewerState(activeViewerId, state);
    } catch {
      return undefined;
    }
  });
}
