import { createSlice } from "@reduxjs/toolkit";
import { mockAccounts } from "./mockAccounts";

const primaryMockAccount = mockAccounts[0] ?? {
  viewerId: null,
  email: "",
  password: "",
};

export function createInitialAuthState({
  savedSession = null,
  fallbackAccount = primaryMockAccount,
  account = fallbackAccount,
} = {}) {
  const nextAccount = account ?? fallbackAccount ?? primaryMockAccount;
  const nextViewerId =
    savedSession?.currentViewerId ?? nextAccount?.viewerId ?? null;
  const isLogged = Boolean(savedSession?.isLogged && nextViewerId);

  return {
    isRegisterModalOpen: false,
    isLoginModalOpen: false,
    isLogged,
    currentViewerId: isLogged ? nextViewerId : null,
    authStatus: isLogged ? "authenticated" : "idle",
    loginError: null,
    accountViewerId: nextAccount?.viewerId ?? null,
    accountEmail: nextAccount?.email ?? "",
    accountPassword: nextAccount?.password ?? "",
  };
}

const initialState = createInitialAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.isLoginModalOpen = true;
      state.isRegisterModalOpen = false;
      state.loginError = null;
      if (state.authStatus === "error") {
        state.authStatus = "idle";
      }
    },

    openRegisterModal: (state) => {
      state.isRegisterModalOpen = true;
      state.isLoginModalOpen = false;
      state.loginError = null;
      if (state.authStatus === "error") {
        state.authStatus = "idle";
      }
    },

    closeAuthModals: (state) => {
      state.isLoginModalOpen = false;
      state.isRegisterModalOpen = false;
      state.loginError = null;
      if (state.authStatus === "error") {
        state.authStatus = "idle";
      }
    },

    logIn: (state) => {
      state.isLogged = true;
      state.isLoginModalOpen = false;
      state.isRegisterModalOpen = false;
      state.currentViewerId = state.accountViewerId;
      state.authStatus = "authenticated";
      state.loginError = null;
    },

    logOut: (state) => {
      state.isLogged = false;
      state.isLoginModalOpen = false;
      state.isRegisterModalOpen = false;
      state.authStatus = "idle";
      state.loginError = null;
      state.currentViewerId = null;
    },

    startLogin: (state) => {
      state.authStatus = "loading";
      state.loginError = null;
    },

    loginSuccess: (state, action) => {
      const nextViewerId =
        action.payload?.viewerId ?? action.payload?.accountViewerId ?? null;

      state.isLogged = true;
      state.currentViewerId = nextViewerId;
      state.accountViewerId = action.payload?.accountViewerId ?? nextViewerId;

      if (typeof action.payload?.email === "string") {
        state.accountEmail = action.payload.email.trim().toLowerCase();
      }

      if (typeof action.payload?.password === "string") {
        state.accountPassword = action.payload.password.trim();
      }

      state.authStatus = "authenticated";
      state.loginError = null;
      state.isLoginModalOpen = false;
      state.isRegisterModalOpen = false;
    },

    loginFailure: (state, action) => {
      state.isLogged = false;
      state.currentViewerId = null;
      state.authStatus = "error";
      state.loginError = action.payload;
    },

    clearLoginError: (state) => {
      state.loginError = null;
      if (state.authStatus === "error") {
        state.authStatus = "idle";
      }
    },

    updateAccountEmail: (state, action) => {
      const nextEmail = action.payload?.trim().toLowerCase();

      if (!nextEmail) {
        return;
      }

      state.accountEmail = nextEmail;
    },

    updateAccountPassword: (state, action) => {
      const nextPassword = action.payload?.trim();

      if (!nextPassword) {
        return;
      }

      state.accountPassword = nextPassword;
    },
  },
});

export const {
  openLoginModal,
  openRegisterModal,
  closeAuthModals,
  logIn,
  logOut,
  startLogin,
  loginFailure,
  loginSuccess,
  clearLoginError,
  updateAccountEmail,
  updateAccountPassword,
} = authSlice.actions;

export default authSlice.reducer;
