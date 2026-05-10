import { useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router";
import { Header } from "../../../widgets/header";
import { Footer } from "../../../widgets/footer";
import { AuthModal } from "../../../widgets/auth-modal";
import { CatalogSidebar } from "../../../widgets/catalog-sidebar";
import { ViewerProfileBootstrap } from "../../../features/viewer";
import {
  selectCurrentViewerId,
  selectIsLoginModalOpen,
  selectIsRegisterModalOpen,
  selectIsLogged,
} from "../../../features/auth";
import { selectIsCatalogOpen } from "../../../features/catalog";
import { ThemeBootstrap } from "../../../features/theme";

function Layout() {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const location = useLocation();
  const isCatalogOpen = useSelector(selectIsCatalogOpen);
  const currentViewerId = useSelector(selectCurrentViewerId);
  const isLogged = useSelector(selectIsLogged);
  const isLoginModalOpen = useSelector(selectIsLoginModalOpen);
  const isRegisterModalOpen = useSelector(selectIsRegisterModalOpen);
  const isAuthModalOpen = isLoginModalOpen || isRegisterModalOpen;
  const shouldShowFooter = !/^\/courses\/[^/]+\/lessons\/[^/]+\/?$/.test(
    location.pathname,
  );
  const appShellStateClassName = [
    "app-shell",
    isCatalogOpen ? "is-catalog-open" : "",
    isAuthModalOpen ? "is-modal-open" : "",
    isCatalogOpen || isAuthModalOpen ? "is-overlay-active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  useLayoutEffect(() => {
    const headerElement = headerRef.current;

    if (!headerElement) {
      return undefined;
    }

    function updateHeaderHeight() {
      setHeaderHeight(Math.ceil(headerElement.getBoundingClientRect().height));
    }

    updateHeaderHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeaderHeight);

      return () => {
        window.removeEventListener("resize", updateHeaderHeight);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    resizeObserver.observe(headerElement);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      "--app-header-height",
      `${headerHeight}px`,
    );

    return () => {
      document.documentElement.style.removeProperty("--app-header-height");
    };
  }, [headerHeight]);

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location.pathname, location.search]);

  return (
    <div className={appShellStateClassName}>
      <div className="app-shell-glow app-shell-glow-left" aria-hidden="true" />
      <div className="app-shell-glow app-shell-glow-right" aria-hidden="true" />
      <ThemeBootstrap />
      <ViewerProfileBootstrap
        currentViewerId={currentViewerId}
        isLogged={isLogged}
      />
      <div
        ref={headerRef}
        className="app-header-shell"
      >
        <Header />
      </div>
      <main
        className="app-main"
        style={{ paddingTop: `${headerHeight}px` }}
      >
        <Outlet />
      </main>
      {shouldShowFooter ? <Footer /> : null}
      <AuthModal />
      <CatalogSidebar headerHeight={headerHeight} />
    </div>
  );
}

export default Layout;
