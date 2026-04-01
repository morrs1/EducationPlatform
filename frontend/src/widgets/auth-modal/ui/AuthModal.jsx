import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearLoginError,
  closeAuthModals,
  loginFailure,
  loginSuccess,
  loginWithMockCredentials,
  openLoginModal,
  openRegisterModal,
  selectIsLoginModalOpen,
  selectIsRegisterModalOpen,
  selectLoginError,
  startLogin,
} from "../../../features/auth";
import { closeCatalog } from "../../../features/catalog";

function AuthModal() {
  const dispatch = useDispatch();
  const isLoginModalOpen = useSelector(selectIsLoginModalOpen);
  const isRegisterModalOpen = useSelector(selectIsRegisterModalOpen);
  const loginError = useSelector(selectLoginError);

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [modalView, setModalView] = useState(null);

  const isOpen = isLoginModalOpen || isRegisterModalOpen;

  function resetCredentials() {
    setEmailInput("");
    setPasswordInput("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (modalView !== "login") {
      return;
    }

    dispatch(startLogin());

    const result = loginWithMockCredentials({
      email: emailInput,
      password: passwordInput,
    });

    if (!result.ok) {
      dispatch(loginFailure(result.error));
      return;
    }

    resetCredentials();
    dispatch(loginSuccess({ viewerId: result.viewerId }));
  }

  function handleClose() {
    resetCredentials();
    dispatch(clearLoginError());
    dispatch(closeAuthModals());
  }

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

  useEffect(() => {
    if (isLoginModalOpen) {
      setModalView("login");
    } else if (isRegisterModalOpen) {
      setModalView("register");
    }
  }, [isLoginModalOpen, isRegisterModalOpen]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimating(true), 100);
      return () => clearTimeout(timer);
    }

    setIsAnimating(false);
    const timer = setTimeout(() => setShouldRender(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      dispatch(closeCatalog());
    }
  }, [dispatch, isOpen]);

  if (!shouldRender) {
    return false;
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/80 transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"}`}
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={handleClose}
      >
        <div
          className={`relative w-full max-w-[95%] rounded-xl bg-white shadow-2xl transition-scale duration-150 sm:max-w-md ${isAnimating ? "scale-100" : "scale-0"}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-500 p-2 sm:p-3">
            <div className="mx-2 flex gap-2 sm:mx-3 sm:gap-4">
              <button
                type="button"
                className={`modal-up-btn text-base sm:text-lg ${modalView === "login" ? "active" : ""}`}
                onClick={handleOpenLogin}
              >
                Вход
              </button>
              <button
                type="button"
                className={`modal-up-btn text-base sm:text-lg ${modalView === "register" ? "active" : ""}`}
                onClick={handleOpenRegister}
              >
                Регистрация
              </button>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="modal-close-btn mx-2 text-xl sm:mx-3 sm:text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="p-3 sm:p-4">
            <form onSubmit={handleSubmit}>
              {modalView === "login" ? (
                <div className="my-3 grid gap-3 sm:my-4 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Email"
                    className="modal-input w-full text-sm sm:text-base"
                    value={emailInput}
                    onChange={handleEmailChange}
                  />
                  <input
                    type="password"
                    placeholder="Пароль"
                    className="modal-input w-full text-sm sm:text-base"
                    value={passwordInput}
                    onChange={handlePasswordChange}
                  />
                  {loginError ? (
                    <span className="text-red-600">{loginError}</span>
                  ) : null}
                </div>
              ) : (
                <div className="my-3 grid gap-3 sm:my-4 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Имя и фамилия"
                    className="modal-input w-full text-sm sm:text-base"
                  />
                  <input
                    type="text"
                    placeholder="Email"
                    className="modal-input w-full text-sm sm:text-base"
                  />
                  <input
                    type="text"
                    placeholder="Пароль"
                    className="modal-input w-full text-sm sm:text-base"
                  />
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type={modalView === "login" ? "submit" : "button"}
                  className="modal-submit-btn text-base sm:text-lg"
                >
                  {modalView === "login" ? "Войти" : "Зарегистрироваться"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AuthModal;
