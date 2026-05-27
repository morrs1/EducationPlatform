import { Outlet } from "react-router";
import { useSelector } from "react-redux";

import { selectCanTeach } from "../../../features/auth";
import { TeachSidebar } from "../../../widgets/teach-sidebar";

function TeachPage() {
  const canTeach = useSelector(selectCanTeach);

  return (
    <div className="teach-layout">
      <aside className="teach-layout-sidebar-rail">
        <TeachSidebar />
      </aside>

      <main className="teach-layout-main-rail">
        <section
          className={
            canTeach ? "teach-page" : "teach-page teach-page--no-teach-access"
          }
        >
          {canTeach ? (
            <Outlet />
          ) : (
            <div className="teach-no-teach-access-card">
              <p>
                У вас недостаточно прав для преподавания. Обратитесь к
                администратору.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default TeachPage;
