import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router";
import AuthModal from "../features/auth/components/AuthModal";
import CatalogSidebar from "../features/catalog/components/CatalogSidebar";

function Layout() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
      <CatalogSidebar />
    </div>
  );
}

export default Layout;
