import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../../features/auth";
import { catalogReducer } from "../../features/catalog";
import { lessonSessionReducer } from "../../features/lesson-session";
import { viewerReducer } from "../../features/viewer";
import { mockAccounts } from "../../features/auth/model/mockAccounts";
import { mockViewer } from "../../features/viewer/model/mockViewer";

const primaryMockAccount = mockAccounts[0] ?? {
  viewerId: null,
  email: "",
  password: "",
};

function createDefaultAuthState(savedAuthState, legacySavedIsLogged) {
  const persistedIsLogged =
    savedAuthState?.isLogged ?? legacySavedIsLogged === "true";
  const persistedViewerId =
    savedAuthState?.currentViewerId ??
    (persistedIsLogged ? mockViewer.id : null);

  return {
    isRegisterModalOpen: false,
    isLoginModalOpen: false,
    isLogged: persistedIsLogged,
    currentViewerId: persistedViewerId,
    authStatus: persistedIsLogged ? "authenticated" : "idle",
    loginError: null,
    accountViewerId:
      savedAuthState?.accountViewerId ?? primaryMockAccount.viewerId,
    accountEmail: savedAuthState?.accountEmail ?? primaryMockAccount.email,
    accountPassword:
      savedAuthState?.accountPassword ?? primaryMockAccount.password,
  };
}

function createDefaultViewerState() {
  return structuredClone(mockViewer);
}

function loadPreloadedState() {
  try {
    const savedAuth = localStorage.getItem("authState");
    const legacySavedIsLogged = localStorage.getItem("isLogged");
    const savedViewer = localStorage.getItem("viewerState");
    const parsedAuth = savedAuth ? JSON.parse(savedAuth) : null;

    return {
      auth: createDefaultAuthState(parsedAuth, legacySavedIsLogged),
      viewer: savedViewer
        ? {
            ...createDefaultViewerState(),
            ...JSON.parse(savedViewer),
          }
        : createDefaultViewerState(),
    };
  } catch {
    return {
      auth: createDefaultAuthState(null, null),
      viewer: createDefaultViewerState(),
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

store.subscribe(() => {
  try {
    const state = store.getState();

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
    localStorage.setItem("viewerState", JSON.stringify(state.viewer));
  } catch {}
});

export default store;
