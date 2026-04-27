import { Outlet } from "react-router";
import TeachSidebar from "../../../widgets/teach-sidebar/ui/TeachSidebar";

function TeachPage() {
  return (
    <div className="teach-layout">
      <aside className="teach-layout-sidebar-rail">
        <TeachSidebar />
      </aside>

      <main className="teach-layout-main-rail">
        <section className="teach-page">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default TeachPage;
