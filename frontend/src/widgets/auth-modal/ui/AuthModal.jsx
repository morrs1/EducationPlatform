import { useEffect, useRef, useState } from "react";
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
} from "../../../features/auth";
import { closeCatalog } from "../../../features/catalog";

function AuthModal() {
  const registerAvatarInputId = "register-avatar-upload";
  const dispatch = useDispatch();
  const isLoginModalOpen = useSelector(selectIsLoginModalOpen);
  const isRegisterModalOpen = useSelector(selectIsRegisterModalOpen);
  const loginError = useSelector(selectLoginError);
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
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [modalView, setModalView] = useState(null);

  const isOpen = isLoginModalOpen || isRegisterModalOpen;

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

  function handleSubmit(event) {
    event.preventDefault();

    const result =
      modalView === "login"
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
          );

    if (result.ok) {
      resetCredentials();
    }
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
                    type="email"
                    placeholder="Email"
                    className="modal-input w-full text-sm sm:text-base"
                    value={emailInput}
                    onChange={handleEmailChange}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Пароль"
                    className="modal-input w-full text-sm sm:text-base"
                    value={passwordInput}
                    onChange={handlePasswordChange}
                    required
                  />
                  {loginError ? (
                    <span className="text-red-600">{loginError}</span>
                  ) : null}
                </div>
              ) : (
                <div className="my-3 grid gap-3 sm:my-4 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Фамилия Имя Отчество"
                    className="modal-input w-full text-sm sm:text-base"
                    value={registerNameInput}
                    onChange={handleRegisterNameChange}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="modal-input w-full text-sm sm:text-base"
                    value={registerEmailInput}
                    onChange={handleRegisterEmailChange}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Пароль"
                    className="modal-input w-full text-sm sm:text-base"
                    value={registerPasswordInput}
                    onChange={handleRegisterPasswordChange}
                    required
                  />

                  <textarea
                    placeholder="Статус в профиле, коротко о себе. Например: Ищу первую стажировку во frontend"
                    className="modal-input min-h-24 w-full resize-y py-3 text-sm sm:text-base"
                    value={registerStatusInput}
                    onChange={handleRegisterStatusChange}
                    rows={3}
                  />

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-200">
                        {registerAvatarPreviewSrc ? (
                          <img
                            src={registerAvatarPreviewSrc}
                            alt="Предпросмотр фото профиля"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-500">
                            Фото
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          Фото профиля
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Необязательно. Можно выбрать изображение с устройства
                          и сразу увидеть превью.
                        </p>
                        <p className="mt-2 truncate text-xs text-slate-600">
                          {registerAvatarFileName}
                        </p>

                        <input
                          id={registerAvatarInputId}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleRegisterAvatarChange}
                        />

                        <label
                          htmlFor={registerAvatarInputId}
                          className="mt-3 inline-flex cursor-pointer items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                        >
                          Выбрать фото
                        </label>
                      </div>
                    </div>
                  </div>

                  {loginError ? (
                    <span className="text-red-600">{loginError}</span>
                  ) : null}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
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
