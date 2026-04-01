import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../../features/auth";
import { catalogReducer } from "../../features/catalog";
import { viewerReducer } from "../../features/viewer";
import { mockViewer } from "../../features/viewer/model/mockViewer";

const createDefaultAuthState = (savedIsLogged) => ({
  isRegisterModalOpen: false,
  isLoginModalOpen: false,
  isLogged: savedIsLogged === "true",
});

const createDefaultViewerState = () => structuredClone(mockViewer);

const loadPreloadedState = () => {
  try {
    const savedIsLogged = localStorage.getItem("isLogged");
    const savedViewer = localStorage.getItem("viewerState");

    return {
      auth: createDefaultAuthState(savedIsLogged),
      viewer: savedViewer
        ? {
            ...createDefaultViewerState(),
            ...JSON.parse(savedViewer),
          }
        : createDefaultViewerState(),
    };
  } catch {
    return {
      auth: createDefaultAuthState(null),
      viewer: createDefaultViewerState(),
    };
  }
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    viewer: viewerReducer,
  },
  preloadedState: loadPreloadedState(),
});

store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem("isLogged", String(state.auth.isLogged));
    localStorage.setItem("viewerState", JSON.stringify(state.viewer));
  } catch {}
});

export default store;
