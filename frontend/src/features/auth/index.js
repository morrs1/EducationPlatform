export { default as authReducer } from "./model/authSlice";

export {
  openLoginModal,
  openRegisterModal,
  closeAuthModals,
  logIn,
  logOut,
} from "./model/authSlice";

export {
  selectIsLogged,
  selectIsLoginModalOpen,
  selectIsRegisterModalOpen,
} from "./model/selectors";
