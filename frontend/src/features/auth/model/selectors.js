export const selectIsLogged = (state) => state.auth.isLogged;
export const selectIsLoginModalOpen = (state) => state.auth.isLoginModalOpen;
export const selectIsRegisterModalOpen = (state) =>
  state.auth.isRegisterModalOpen;
export const selectCurrentViewerId = (state) => state.auth.currentViewerId;
export const selectAuthStatus = (state) => state.auth.authStatus;
export const selectLoginError = (state) => state.auth.loginError;
export const selectAccountViewerId = (state) => state.auth.accountViewerId;
export const selectAccountEmail = (state) => state.auth.accountEmail;
