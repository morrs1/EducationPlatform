import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router";
import AuthModal from "../features/auth/components/authModal";
import CatalogSidebar from "../features/catalog/components/CatalogSidebar";

function Layout() {
  return (
    <>
      <Header />
      <main className="container flex-1 px-2 py-2 mx-auto sm:px-4 sm:py-4">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
      <CatalogSidebar />
    </>
  );
}

export default Layout;
