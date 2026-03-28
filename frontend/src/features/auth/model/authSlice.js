import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isRegisterModalOpen: false,
  isLoginModalOpen: false,
  isLogged: false,
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
      state.isLogged = true;
      state.isLoginModalOpen = false;
      state.isRegisterModalOpen = false;
    },

    logOut: (state) => {
      state.isLogged = false;
    },
  },
});

export const {
  openLoginModal,
  openRegisterModal,
  closeAuthModals,
  logIn,
  logOut,
} = authSlice.actions;

export default authSlice.reducer;
