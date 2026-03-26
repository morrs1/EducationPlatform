import { useDispatch, useSelector } from "react-redux";
import { openLoginModal, openRegisterModal } from "../features/auth/authSlice";
import { closeCatalog, openCatalog } from "../features/catalog/catalogSlice";
import { useEffect, useRef, useState } from "react";
import { logOut } from "../features/auth/authSlice";
import { NavLink } from "react-router";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const isCatalogOpen = useSelector((state) => state.catalog.isCatalogOpen);
  const isLoged = useSelector((state) => state.auth.isLoged);
  console.log(isLoged);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <header className="flex flex-col items-center justify-between gap-2 px-3 py-2 md:flex-row sm:px-4 md:px-6 sm:py-3 bg-gray-950 md:gap-0">
      <div className="flex items-center justify-between w-full gap-2 md:w-auto sm:gap-4">
        <img
          src="/logo.png"
          alt="Логотип"
          className="w-auto h-6 sm:h-6 md:h-10"
        />
        <button
          className="text-sm header-catalog-btn sm:text-base whitespace-nowrap"
          onClick={() =>
            isCatalogOpen ? dispatch(closeCatalog()) : dispatch(openCatalog())
          }
        >
          Каталог
        </button>
      </div>

      <div className="w-full md:flex-1 md:mx-4">
        <input
          type="text"
          placeholder="Поиск..."
          className="w-full header-search"
        />
      </div>

      <div className="flex justify-center w-full gap-2 md:w-auto sm:gap-3">
        {!isLoged ? (
          <>
            <button
              className="flex-1 header-btn md:flex-none"
              onClick={() => dispatch(openLoginModal())}
            >
              Войти
            </button>
            <button
              className="flex-1 header-btn md:flex-none"
              onClick={() => dispatch(openRegisterModal())}
            >
              Зарегистрироваться
            </button>
          </>
        ) : null}

        <div className="header-profile-menu-wrap" ref={menuRef}>
          {isLoged && (
            <button
              type="button"
              className={`header-profile-trigger ${isMenuOpen ? "is-open" : ""}`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((value) => !value)}
            >
              <img
                src="https://www.shutterstock.com/image-photo/stylish-black-cat-wearing-sunglasses-260nw-2629842553.jpg"
                alt="Профиль пользователя"
                className="header-profile-avatar"
              />
            </button>
          )}

          {isMenuOpen ? (
            <div className="header-profile-menu" role="menu">
              <NavLink
                to="/account"
                className="header-profile-menu-item"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                }}
              >
                Профиль
              </NavLink>

              <button
                type="button"
                className="header-profile-menu-item"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                Настройки
              </button>

              <button
                type="button"
                className="header-profile-menu-item danger"
                role="menuitem"
                onClick={() => {
                  (dispatch(logOut()), setIsMenuOpen(false));
                }}
              >
                Выйти
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Header;
