export const selectIsLogged = (state) => state.auth.isLogged;
export const selectIsLoginModalOpen = (state) => state.auth.isLoginModalOpen;
export const selectIsRegisterModalOpen = (state) =>
  state.auth.isRegisterModalOpen;
export const selectCurrentViewerId = (state) => state.auth.currentViewerId;
export const selectAuthStatus = (state) => state.auth.authStatus;
export const selectLoginError = (state) => state.auth.loginError;
export const selectAccountViewerId = (state) => state.auth.accountViewerId;
export const selectAccountEmail = (state) => state.auth.accountEmail;
export const selectUserRole = (state) => state.auth.userRole;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectPostLoginRedirect = (state) =>
  state.auth.postLoginRedirect;

/** Gateway / user_service role string (e.g. USER, AUTHOR, ADMIN). */
export function roleAllowsTeaching(role) {
  const normalized = typeof role === "string" ? role.trim().toUpperCase() : "";
  return normalized === "AUTHOR" || normalized === "ADMIN";
}

export const selectCanTeach = (state) => roleAllowsTeaching(selectUserRole(state));
