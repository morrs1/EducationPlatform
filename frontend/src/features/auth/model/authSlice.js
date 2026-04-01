import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isRegisterModalOpen: false,
  isLoginModalOpen: false,
  isLogged: false,
  currentViewerId: null,
  authStatus: "idle",
  loginError: null,
};

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
      state.isLogged = true;
      state.currentViewerId = action.payload.viewerId;
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
} = authSlice.actions;

export default authSlice.reducer;
