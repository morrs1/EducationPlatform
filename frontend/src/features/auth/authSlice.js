import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isRegisterModalOpen: false,
  isLoginModalOpen: false,
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
  },
});

export default authSlice.reducer;
export const { openLoginModal } = authSlice.actions;
export const { openRegisterModal } = authSlice.actions;
export const { closeAuthModals } = authSlice.actions;
