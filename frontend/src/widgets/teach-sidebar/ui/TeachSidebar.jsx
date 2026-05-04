import { Link, useLocation, useResolvedPath } from "react-router";

function TeachSidebar() {
  const location = useLocation();
  const publishedCoursesPath = useResolvedPath("courses/published");
  const draftCoursesPath = useResolvedPath("courses/drafts");
  const createCoursePath = useResolvedPath("courses/new");
  const isPublishedCoursesActive = location.pathname.startsWith(
    publishedCoursesPath.pathname,
  );
  const isDraftCoursesActive =
    location.pathname.startsWith(draftCoursesPath.pathname) ||
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
        to="courses/published"
        className={`teach-sidebar-navlink${isPublishedCoursesActive ? " is-active" : ""}`}
        aria-current={isPublishedCoursesActive ? "page" : undefined}
      >
        Опубликованные курсы
      </Link>

      <Link
        to="courses/drafts"
        className={`teach-sidebar-navlink${isDraftCoursesActive ? " is-active" : ""}`}
        aria-current={isDraftCoursesActive ? "page" : undefined}
      >
        Черновики
      </Link>
    </nav>
  );
}

export default TeachSidebar;
