import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import catalogReducer from "./features/catalog/catalogSlice";

const loadAuthState = () => {
  try {
    const savedIsLoged = localStorage.getItem("isLoged");
    return {
      auth: {
        isRegisterModalOpen: false,
        isLoginModalOpen: false,
        isLoged: savedIsLoged === "true",
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
    localStorage.setItem("isLoged", String(state.auth.isLoged));
  } catch {}
});

export default store;
