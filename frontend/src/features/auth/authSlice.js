import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isRegisterModalOpen: false,
  isLoginModalOpen: false,
  isLoged: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.isLoginModalOpen = true;
      state.isRegisterModalOpen = false;
    },

    openRegisterModal: (state) => {
      state.isRegisterModalOpen = true;
      state.isLoginModalOpen = false;
    },

    closeAuthModals: (state) => {
      state.isLoginModalOpen = false;
      state.isRegisterModalOpen = false;
    },

    logIn: (state) => {
      state.isLoged = true;
      state.isLoginModalOpen = false;
      state.isRegisterModalOpen = false;
    },

    logOut: (state) => {
      state.isLoged = false;
    },
  },
});

export default authSlice.reducer;
export const { openLoginModal } = authSlice.actions;
export const { openRegisterModal } = authSlice.actions;
export const { closeAuthModals } = authSlice.actions;
export const { logIn } = authSlice.actions;
export const { logOut } = authSlice.actions;
