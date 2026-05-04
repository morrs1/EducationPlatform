export { default as authReducer } from "./model/authSlice";
export { loginWithMockCredentials } from "./model/loginWithMockCredentials";
export {
  submitLogin,
  submitRegister,
  submitEmailChange,
  submitPasswordChange,
} from "./model/thunks";

export {
  createInitialAuthState,
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
  createDefaultAccountsMap,
  loadAccountsMap,
  saveAccountsMap,
  getPrimaryAccount,
  getAccountByViewerId,
  findAccountByEmail,
  upsertAccount,
} from "./model/persistence";

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
