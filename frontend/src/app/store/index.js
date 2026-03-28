import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../../features/auth";
import { catalogReducer } from "../../features/catalog";

const loadAuthState = () => {
  try {
    const savedIsLogged = localStorage.getItem("isLogged");
    return {
      auth: {
        isRegisterModalOpen: false,
        isLoginModalOpen: false,
        isLogged: savedIsLogged === "true",
      },
    };
  } catch {
    return undefined;
  }
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
  },
  preloadedState: loadAuthState(),
});

store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem("isLogged", String(state.auth.isLogged));
  } catch {}
});

export default store;
