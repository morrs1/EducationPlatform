export { default as authReducer } from "./model/authSlice";
export { loginWithMockCredentials } from "./model/loginWithMockCredentials";

export {
  openLoginModal,
  openRegisterModal,
  closeAuthModals,
  logIn,
  logOut,
  startLogin,
  loginSuccess,
  loginFailure,
  clearLoginError,
} from "./model/authSlice";

export {
  selectIsLogged,
  selectIsLoginModalOpen,
  selectIsRegisterModalOpen,
  selectAuthStatus,
  selectCurrentViewerId,
  selectLoginError,
} from "./model/selectors";
