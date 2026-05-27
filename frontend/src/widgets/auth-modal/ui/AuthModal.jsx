import { useEffect, useEffectEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  clearLoginError,
  clearPostLoginRedirect,
  closeAuthModals,
  openLoginModal,
  openRegisterModal,
  submitLogin,
  submitRegister,
  selectIsLogged,
  selectIsLoginModalOpen,
  selectIsRegisterModalOpen,
  selectLoginError,
  selectAuthStatus,
  selectPostLoginRedirect,
} from "../../../features/auth";
import { closeCatalog } from "../../../features/catalog";
import { hydrateViewerFromUserService } from "../../../features/viewer";
import { useAuthModalForm } from "../model/useAuthModalForm";
import AuthModalForm from "./AuthModalForm";

function AuthModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoginModalOpen = useSelector(selectIsLoginModalOpen);
  const isRegisterModalOpen = useSelector(selectIsRegisterModalOpen);
  const isLogged = useSelector(selectIsLogged);
  const postLoginRedirect = useSelector(selectPostLoginRedirect);
  const loginError = useSelector(selectLoginError);
  const authStatus = useSelector(selectAuthStatus);
  const form = useAuthModalForm({
    clearError: () => dispatch(clearLoginError()),
    error: loginError,
  });

  const isOpen = isLoginModalOpen || isRegisterModalOpen;
  const modalView = isRegisterModalOpen ? "register" : "login";
  const isAuthBusy = authStatus === "loading";


  async function handleSubmit(event) {
    event.preventDefault();

    const result = await (modalView === "login"
      ? dispatch(
          submitLogin({
            email: form.login.email,
            password: form.login.password,
          }),
        )
      : dispatch(
          submitRegister({
            fullName: form.register.name,
            email: form.register.email,
            password: form.register.password,
            status: form.register.status,
            avatarFile: form.register.avatarFile,
          }),
        ));

    if (result?.ok) {
      if (modalView === "register" && result.viewerId) {
        dispatch(
          hydrateViewerFromUserService({
            remoteViewerId: result.viewerId,
          }),
        );
      }

      form.reset();
    }
  }

  function handleClose() {
    form.reset();
    dispatch(clearLoginError());
    dispatch(closeAuthModals());
  }

  const handleCloseOnEscape = useEffectEvent(() => {
    handleClose();
  });

  function handleOpenLogin() {
    dispatch(clearLoginError());
    dispatch(openLoginModal());
  }

  function handleOpenRegister() {
    dispatch(clearLoginError());
    dispatch(openRegisterModal());
  }


  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const { body, documentElement } = document;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      documentElement.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      dispatch(closeCatalog());
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (isLogged && postLoginRedirect) {
      navigate(postLoginRedirect);
      dispatch(clearPostLoginRedirect());
    }
  }, [dispatch, isLogged, navigate, postLoginRedirect]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleEscapeKeyDown(event) {
      if (event.key === "Escape") {
        handleCloseOnEscape();
      }
    }

    document.addEventListener("keydown", handleEscapeKeyDown);

    return () => {
      document.removeEventListener("keydown", handleEscapeKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      className={`auth-modal-root ${isOpen ? "is-open" : ""}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Закрыть окно авторизации"
        tabIndex={isOpen ? 0 : -1}
        className="auth-modal-backdrop"
        onClick={handleClose}
      />
      <div
        className="auth-modal-shell"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={modalView === "login" ? "Вход в аккаунт" : "Регистрация аккаунта"}
          className="auth-modal-panel"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="auth-modal-header">
            <div className="auth-modal-tabs">
              <button
                type="button"
                className={`auth-modal-tab ${modalView === "login" ? "active" : ""}`}
                onClick={handleOpenLogin}
              >
                Вход
              </button>
              <button
                type="button"
                className={`auth-modal-tab ${modalView === "register" ? "active" : ""}`}
                onClick={handleOpenRegister}
              >
                Регистрация
              </button>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="auth-modal-close"
            >
              ✕
            </button>
          </div>

          <div className="auth-modal-body">
            <AuthModalForm
              error={loginError}
              form={form}
              isBusy={isAuthBusy}
              onSubmit={handleSubmit}
              view={modalView}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
