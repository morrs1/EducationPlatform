import { useLayoutEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router";
import Header from "../../header/ui/Header";
import Footer from "../../footer/ui/Footer";
import AuthModal from "../../auth-modal/ui/AuthModal";
import CatalogSidebar from "../../catalog-sidebar/ui/CatalogSidebar";

function Layout() {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const location = useLocation();

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
    <div className="flex flex-col w-full min-h-screen">
      <div
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-40 bg-gray-950 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.7)]"
      >
        <Header />
      </div>
      <main
        className="flex-1 w-full"
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
