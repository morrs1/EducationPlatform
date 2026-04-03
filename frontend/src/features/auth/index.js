export { default as authReducer } from "./model/authSlice";
export { loginWithMockCredentials } from "./model/loginWithMockCredentials";
export {
  submitLogin,
  submitEmailChange,
  submitPasswordChange,
} from "./model/thunks";

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
  updateAccountEmail,
  updateAccountPassword,
} from "./model/authSlice";

export {
  selectIsLogged,
  selectIsLoginModalOpen,
  selectIsRegisterModalOpen,
  selectAuthStatus,
  selectCurrentViewerId,
  selectLoginError,
  selectAccountViewerId,
  selectAccountEmail,
} from "./model/selectors";
