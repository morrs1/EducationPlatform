import { useDispatch, useSelector } from "react-redux";
import {
  closeAuthModals,
  openLoginModal,
  openRegisterModal,
} from "../authSlice";
import { closeCatalog } from "../../catalog/catalogSlice";
import { useEffect, useState } from "react";

function AuthModal() {
  const dispatch = useDispatch();
  const isLoginModalOpen = useSelector((state) => state.auth.isLoginModalOpen);
  const isRegisterModalOpen = useSelector(
    (state) => state.auth.isRegisterModalOpen,
  );

  const handleClose = () => {
    dispatch(closeAuthModals());
  };

  const isOpen = isLoginModalOpen || isRegisterModalOpen;

  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimating(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return false;

  if (isOpen) dispatch(closeCatalog());

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/80 transition-opacity duration-150 ${isAnimating ? "opacity-100" : "opacity-0"}`}
      ></div>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={handleClose}
      >
        <div
          className={`relative w-full max-w-[95%] sm:max-w-md bg-white shadow-2xl rounded-xl transition-scale duration-150 ${isAnimating ? "scale-100" : "scale-0"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-2 border-b border-gray-500 sm:p-3">
            <div className="flex gap-2 mx-2 sm:gap-4 sm:mx-3">
              <button
                className={`modal-up-btn text-base sm:text-lg ${isLoginModalOpen && "active"}`}
                onClick={() => dispatch(openLoginModal())}
              >
                Вход
              </button>
              <button
                className={`modal-up-btn text-base sm:text-lg ${isRegisterModalOpen && "active"}`}
                onClick={() => dispatch(openRegisterModal())}
              >
                Регистрация
              </button>
            </div>

            <button
              onClick={handleClose}
              className="mx-2 text-xl sm:mx-3 modal-close-btn sm:text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="p-3 sm:p-4">
            <form>
              {isLoginModalOpen && (
                <div className="grid gap-3 my-3 sm:gap-4 sm:my-4">
                  <input
                    type="text"
                    placeholder="Email"
                    className="w-full text-sm modal-input sm:text-base"
                  />
                  <input
                    type="text"
                    placeholder="Пароль"
                    className="w-full text-sm modal-input sm:text-base"
                  />
                </div>
              )}

              {isRegisterModalOpen && (
                <div className="grid gap-3 my-3 sm:gap-4 sm:my-4">
                  <input
                    type="text"
                    placeholder="Имя и фамилия"
                    className="w-full text-sm modal-input sm:text-base"
                  />
                  <input
                    type="text"
                    placeholder="Email"
                    className="w-full text-sm modal-input sm:text-base"
                  />
                  <input
                    type="text"
                    placeholder="Пароль"
                    className="w-full text-sm modal-input sm:text-base"
                  />
                </div>
              )}

              <div className="flex justify-center">
                <button className="text-base modal-submit-btn sm:text-lg">
                  {isLoginModalOpen ? "Войти" : "Зарегистрироваться"}
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
