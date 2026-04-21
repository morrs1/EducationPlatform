import { useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router";
import Header from "../../header/ui/Header";
import Footer from "../../footer/ui/Footer";
import AuthModal from "../../auth-modal/ui/AuthModal";
import CatalogSidebar from "../../catalog-sidebar/ui/CatalogSidebar";
import { ViewerProfileBootstrap } from "../../../features/viewer";
import {
  selectIsLoginModalOpen,
  selectIsRegisterModalOpen,
} from "../../../features/auth";
import { selectIsCatalogOpen } from "../../../features/catalog";
import { ThemeBootstrap } from "../../../features/theme";

function Layout() {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const location = useLocation();
  const isCatalogOpen = useSelector(selectIsCatalogOpen);
  const isLoginModalOpen = useSelector(selectIsLoginModalOpen);
  const isRegisterModalOpen = useSelector(selectIsRegisterModalOpen);
  const isAuthModalOpen = isLoginModalOpen || isRegisterModalOpen;
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
      <ViewerProfileBootstrap />
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
      <Footer />
      <AuthModal />
      <CatalogSidebar headerHeight={headerHeight} />
    </div>
  );
}

export default Layout;
