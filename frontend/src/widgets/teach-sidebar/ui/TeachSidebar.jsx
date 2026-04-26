import { Link, useLocation, useResolvedPath } from "react-router";

function TeachSidebar() {
  const location = useLocation();
  const coursesPath = useResolvedPath("courses");
  const createCoursePath = useResolvedPath("courses/new");
  const isCoursesActive =
    location.pathname.startsWith(coursesPath.pathname) ||
    location.pathname.startsWith(createCoursePath.pathname);

  return (
    <nav className="teach-sidebar" aria-label="Разделы преподавателя">
      <Link
        to="courses/new"
        className="teach-sidebar-navlink teach-sidebar-navlink-create"
      >
        + Новый курс
      </Link>
      <Link
        to="courses"
        className={`teach-sidebar-navlink${isCoursesActive ? " is-active" : ""}`}
        aria-current={isCoursesActive ? "page" : undefined}
      >
        Курсы
      </Link>
    </nav>
  );
}

export default TeachSidebar;
