import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearLoginError,
  closeAuthModals,
  openLoginModal,
  openRegisterModal,
  submitLogin,
  submitRegister,
  selectIsLoginModalOpen,
  selectIsRegisterModalOpen,
  selectLoginError,
  selectAuthStatus,
} from "../../../features/auth";
import { closeCatalog } from "../../../features/catalog";

function AuthModal() {
  const registerAvatarInputId = "register-avatar-upload";
  const dispatch = useDispatch();
  const isLoginModalOpen = useSelector(selectIsLoginModalOpen);
  const isRegisterModalOpen = useSelector(selectIsRegisterModalOpen);
  const loginError = useSelector(selectLoginError);
  const authStatus = useSelector(selectAuthStatus);
  const registerAvatarObjectUrlRef = useRef(null);

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [registerNameInput, setRegisterNameInput] = useState("");
  const [registerEmailInput, setRegisterEmailInput] = useState("");
  const [registerPasswordInput, setRegisterPasswordInput] = useState("");
  const [registerStatusInput, setRegisterStatusInput] = useState("");
  const [registerAvatarDataUrl, setRegisterAvatarDataUrl] = useState("");
  const [registerAvatarPreviewSrc, setRegisterAvatarPreviewSrc] = useState("");
  const [registerAvatarFileName, setRegisterAvatarFileName] =
    useState("Фото не выбрано");

  const isOpen = isLoginModalOpen || isRegisterModalOpen;
  const modalView = isRegisterModalOpen ? "register" : "login";
  const isAuthBusy = authStatus === "loading";

  useEffect(() => {
    return () => {
      if (registerAvatarObjectUrlRef.current) {
        URL.revokeObjectURL(registerAvatarObjectUrlRef.current);
      }
    };
  }, []);

  function resetCredentials() {
    if (registerAvatarObjectUrlRef.current) {
      URL.revokeObjectURL(registerAvatarObjectUrlRef.current);
      registerAvatarObjectUrlRef.current = null;
    }

    setEmailInput("");
    setPasswordInput("");
    setRegisterNameInput("");
    setRegisterEmailInput("");
    setRegisterPasswordInput("");
    setRegisterStatusInput("");
    setRegisterAvatarDataUrl("");
    setRegisterAvatarPreviewSrc("");
    setRegisterAvatarFileName("Фото не выбрано");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const result = await (modalView === "login"
      ? dispatch(
          submitLogin({
            email: emailInput,
            password: passwordInput,
          }),
        )
      : dispatch(
          submitRegister({
            fullName: registerNameInput,
            email: registerEmailInput,
            password: registerPasswordInput,
            status: registerStatusInput,
            avatarUrl: registerAvatarDataUrl,
          }),
        ));

    if (result?.ok) {
      resetCredentials();
    }
  }

  function handleClose() {
    resetCredentials();
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

  function handleEmailChange(event) {
    if (loginError) {
      dispatch(clearLoginError());
    }

    setEmailInput(event.target.value);
  }

  function handlePasswordChange(event) {
    if (loginError) {
      dispatch(clearLoginError());
    }

    setPasswordInput(event.target.value);
  }

  function handleRegisterNameChange(event) {
    if (loginError) {
      dispatch(clearLoginError());
    }

    setRegisterNameInput(event.target.value);
  }

  function handleRegisterEmailChange(event) {
    if (loginError) {
      dispatch(clearLoginError());
    }

    setRegisterEmailInput(event.target.value);
  }

  function handleRegisterPasswordChange(event) {
    if (loginError) {
      dispatch(clearLoginError());
    }

    setRegisterPasswordInput(event.target.value);
  }

  function handleRegisterStatusChange(event) {
    if (loginError) {
      dispatch(clearLoginError());
    }

    setRegisterStatusInput(event.target.value);
  }

  function handleRegisterAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (loginError) {
      dispatch(clearLoginError());
    }

    if (registerAvatarObjectUrlRef.current) {
      URL.revokeObjectURL(registerAvatarObjectUrlRef.current);
    }

    const nextObjectUrl = URL.createObjectURL(file);
    registerAvatarObjectUrlRef.current = nextObjectUrl;

    setRegisterAvatarPreviewSrc(nextObjectUrl);
    setRegisterAvatarFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setRegisterAvatarDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
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
            <form onSubmit={handleSubmit}>
              {modalView === "login" ? (
                <div className="auth-modal-grid">
                  <input
                    type="email"
                    placeholder="Email"
                    className="auth-modal-input"
                    value={emailInput}
                    onChange={handleEmailChange}
                    disabled={isAuthBusy}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Пароль"
                    className="auth-modal-input"
                    value={passwordInput}
                    onChange={handlePasswordChange}
                    disabled={isAuthBusy}
                    required
                  />
                  {loginError ? (
                    <span className="auth-modal-feedback error">{loginError}</span>
                  ) : null}
                </div>
              ) : (
                <div className="auth-modal-grid">
                  <input
                    type="text"
                    placeholder="Фамилия Имя Отчество"
                    className="auth-modal-input"
                    value={registerNameInput}
                    onChange={handleRegisterNameChange}
                    disabled={isAuthBusy}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="auth-modal-input"
                    value={registerEmailInput}
                    onChange={handleRegisterEmailChange}
                    disabled={isAuthBusy}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Пароль"
                    className="auth-modal-input"
                    value={registerPasswordInput}
                    onChange={handleRegisterPasswordChange}
                    disabled={isAuthBusy}
                    required
                  />

                  <textarea
                    placeholder="Статус в профиле, коротко о себе. Например: Ищу первую стажировку в веб-разработке"
                    className="auth-modal-input auth-modal-textarea"
                    value={registerStatusInput}
                    onChange={handleRegisterStatusChange}
                    disabled={isAuthBusy}
                    rows={3}
                  />

                  <div className="auth-modal-avatar-picker">
                    <div className="auth-modal-avatar-row">
                      <div className="auth-modal-avatar-preview">
                        {registerAvatarPreviewSrc ? (
                          <img
                            src={registerAvatarPreviewSrc}
                            alt="Предпросмотр фото профиля"
                            className="auth-modal-avatar-image"
                          />
                        ) : (
                          <div className="auth-modal-avatar-empty">
                            Фото
                          </div>
                        )}
                      </div>

                      <div className="auth-modal-avatar-copy">
                        <p className="auth-modal-avatar-title">
                          Фото профиля
                        </p>
                        <p className="auth-modal-avatar-hint">
                          Необязательно. Можно выбрать изображение с устройства
                          и сразу увидеть превью.
                        </p>
                        <p className="auth-modal-avatar-name">
                          {registerAvatarFileName}
                        </p>

                        <input
                          id={registerAvatarInputId}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isAuthBusy}
                          onChange={handleRegisterAvatarChange}
                        />

                        <label
                          htmlFor={registerAvatarInputId}
                          className="auth-modal-avatar-trigger"
                        >
                          Выбрать фото
                        </label>
                      </div>
                    </div>
                  </div>

                  {loginError ? (
                    <span className="auth-modal-feedback error">{loginError}</span>
                  ) : null}
                </div>
              )}

              <div className="auth-modal-actions">
                <button
                  type="submit"
                  className="auth-modal-submit"
                  disabled={isAuthBusy}
                >
                  {isAuthBusy
                    ? "Подождите…"
                    : modalView === "login"
                      ? "Войти"
                      : "Зарегистрироваться"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
