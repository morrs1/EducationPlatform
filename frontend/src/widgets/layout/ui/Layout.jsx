import Header from "../../header/ui/Header";
import Footer from "../../footer/ui/Footer";
import { Outlet } from "react-router";
import AuthModal from "../../auth-modal/ui/AuthModal";
import CatalogSidebar from "../../catalog-sidebar/ui/CatalogSidebar";

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
