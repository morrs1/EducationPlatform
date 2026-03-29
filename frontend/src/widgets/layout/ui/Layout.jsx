import { useLayoutEffect, useRef, useState } from "react";
import { Outlet } from "react-router";
import Header from "../../header/ui/Header";
import Footer from "../../footer/ui/Footer";
import AuthModal from "../../auth-modal/ui/AuthModal";
import CatalogSidebar from "../../catalog-sidebar/ui/CatalogSidebar";

function Layout() {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

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

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div ref={headerRef} className="shrink-0">
        <Header />
      </div>
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
      <CatalogSidebar headerHeight={headerHeight} />
    </div>
  );
}

export default Layout;
