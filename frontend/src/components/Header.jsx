import { useDispatch, useSelector } from "react-redux";
import { openLoginModal, openRegisterModal } from "../features/auth/authSlice";
import { closeCatalog, openCatalog } from "../features/catalog/catalogSlice";

function Header() {
  const dispatch = useDispatch();
  const isCatalogOpen = useSelector((state) => state.catalog.isCatalogOpen);

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
      </div>
    </header>
  );
}

export default Header;
