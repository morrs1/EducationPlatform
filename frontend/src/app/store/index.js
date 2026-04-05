import { configureStore } from "@reduxjs/toolkit";
import {
  authReducer,
  createInitialAuthState,
  getAccountByViewerId,
  getPrimaryAccount,
  loadAccountsMap,
  saveAccountsMap,
  upsertAccount,
} from "../../features/auth";
import { catalogReducer } from "../../features/catalog";
import {
  lessonSessionReducer,
  loadLessonSessionByViewerId,
  restoreLessonSession,
  saveLessonSessionByViewerId,
} from "../../features/lesson-session";
import {
  createInitialViewerState,
  loadViewerProfileByViewerId,
  loadViewerProfilesMap,
  viewerReducer,
  restoreViewer,
  saveViewerProfile,
  saveViewerProfilesMap,
} from "../../features/viewer";

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

function loadPreloadedState() {
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
      ? savedAuthSession.currentViewerId ??
        savedAuthSession.accountViewerId ??
        primaryAccount?.viewerId ??
        null
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

    return {
      auth: createInitialAuthState({
        fallbackAccount: primaryAccount,
        account: primaryAccount,
      }),
      viewer: createInitialViewerState(),
      lessonSession: loadLessonSessionByViewerId(null),
    };
  }
}

const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    lessonSession: lessonSessionReducer,
    viewer: viewerReducer,
  },
  preloadedState: loadPreloadedState(),
});

let activeViewerId = store.getState().auth.currentViewerId;
let isRestoringUserState = false;

store.subscribe(() => {
  try {
    const state = store.getState();
    const nextViewerId = state.auth.currentViewerId;

    localStorage.setItem(
      "authState",
      JSON.stringify({
        isLogged: state.auth.isLogged,
        currentViewerId: state.auth.currentViewerId,
        accountViewerId: state.auth.accountViewerId,
        accountEmail: state.auth.accountEmail,
        accountPassword: state.auth.accountPassword,
      }),
    );

    if (
      state.auth.accountViewerId &&
      state.auth.accountEmail &&
      state.auth.accountPassword
    ) {
      const existingAccount = getAccountByViewerId(state.auth.accountViewerId);

      upsertAccount({
        id: existingAccount?.id ?? `account-${state.auth.accountViewerId}`,
        viewerId: state.auth.accountViewerId,
        email: state.auth.accountEmail,
        password: state.auth.accountPassword,
      });
    }

    if (!isRestoringUserState && nextViewerId !== activeViewerId) {
      if (activeViewerId) {
        saveViewerProfile({
          ...state.viewer,
          id: activeViewerId,
          email: state.viewer.email || state.auth.accountEmail,
        });

        saveLessonSessionByViewerId(activeViewerId, state.lessonSession);
      }

      activeViewerId = nextViewerId;
      isRestoringUserState = true;
      store.dispatch(restoreViewer(loadViewerProfileByViewerId(nextViewerId)));
      store.dispatch(
        restoreLessonSession(loadLessonSessionByViewerId(nextViewerId)),
      );
      isRestoringUserState = false;
      return;
    }

    if (activeViewerId) {
      saveViewerProfile({
        ...state.viewer,
        id: activeViewerId,
        email: state.viewer.email || state.auth.accountEmail,
      });
      saveLessonSessionByViewerId(activeViewerId, state.lessonSession);
    }
  } catch {}
});

export default store;
