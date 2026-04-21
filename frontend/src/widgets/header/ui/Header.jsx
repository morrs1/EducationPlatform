import { useDispatch, useSelector } from "react-redux";
import {
  openLoginModal,
  openRegisterModal,
  selectIsLogged,
  logOut,
} from "../../../features/auth";
import {
  closeCatalog,
  openCatalog,
  selectIsCatalogOpen,
} from "../../../features/catalog";
import {
  selectViewerAvatarUrl,
  selectViewerName,
} from "../../../features/viewer";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { ThemeToggleButton } from "../../../features/theme";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const isCatalogOpen = useSelector(selectIsCatalogOpen);
  const isLogged = useSelector(selectIsLogged);
  const viewerAvatarUrl = useSelector(selectViewerAvatarUrl);
  const viewerName = useSelector(selectViewerName);

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
    <header className="header-shell">
      <div className="header-brand-cluster">
        <button
          data-catalog-toggle="true"
          className="header-catalog-btn"
          onClick={() =>
            isCatalogOpen ? dispatch(closeCatalog()) : dispatch(openCatalog())
          }
        >
          Каталог
        </button>

        <NavLink
          className="header-brand"
          to="/"
          onClick={() => dispatch(closeCatalog())}
        >
          <span className="header-brand-mark">EP</span>
          <span className="header-brand-copy">
            <span className="header-brand-eyebrow">Трек, практика, прогресс</span>
            <span className="header-brand-title">EduPlatform</span>
          </span>
        </NavLink>
      </div>

      <label className="header-search-wrap">
        <span className="header-search-kicker">Быстрый поиск</span>
        <input
          type="text"
          placeholder="Название курса, автор или направление"
          className="header-search"
        />
      </label>

      <div className="header-actions">
        <ThemeToggleButton />

        {!isLogged ? (
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

        {isLogged ? (
          <span className="header-viewer-pill">{viewerName}</span>
        ) : null}

        <div className="header-profile-menu-wrap" ref={menuRef}>
          {isLogged && (
            <button
              type="button"
              className={`header-profile-trigger ${isMenuOpen ? "is-open" : ""}`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((value) => !value)}
            >
              <img
                src={viewerAvatarUrl}
                alt={viewerName || "Профиль пользователя"}
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
                  dispatch(closeCatalog());
                  setIsMenuOpen(false);
                }}
              >
                Профиль
              </NavLink>

              <NavLink
                to="/editProfile"
                className="header-profile-menu-item"
                role="menuitem"
                onClick={() => {
                  dispatch(closeCatalog());
                  setIsMenuOpen(false);
                }}
              >
                Настройки
              </NavLink>

              <NavLink
                to="/notifications"
                className="header-profile-menu-item"
                role="menuitem"
                onClick={() => {
                  dispatch(closeCatalog());
                  setIsMenuOpen(false);
                }}
              >
                Уведомления
              </NavLink>

              <button
                type="button"
                className="header-profile-menu-item danger"
                role="menuitem"
                onClick={() => {
                  dispatch(closeCatalog());
                  dispatch(logOut());
                  setIsMenuOpen(false);
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
