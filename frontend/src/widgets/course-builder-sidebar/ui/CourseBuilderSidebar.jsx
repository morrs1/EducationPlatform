import { useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useParams,
  useResolvedPath,
} from "react-router";

function CourseBuilderSidebar() {
  const location = useLocation();
  const { courseId } = useParams();
  const descriptionPath = useResolvedPath("description");
  const syllabusPath = useResolvedPath("syllabus");
  const editPath = useResolvedPath("edit");
  const isCourseSectionActive =
    location.pathname.startsWith(descriptionPath.pathname) ||
    location.pathname.startsWith(syllabusPath.pathname) ||
    location.pathname.startsWith(editPath.pathname);
  const isSyllabusActive =
    location.pathname.startsWith(syllabusPath.pathname) ||
    location.pathname.startsWith(editPath.pathname);
  const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(true);

  return (
    <nav className="course-builder-sidebar" aria-label="Навигация по курсу">
      <div className="course-builder-sidebar-summary">
        <span className="course-builder-sidebar-kicker">WORKSPACE</span>
        <strong className="course-builder-sidebar-course-title">
          Черновик курса
        </strong>
        <span className="course-builder-sidebar-course-id">
          ID: {courseId}
        </span>

        <div className="course-builder-sidebar-statuses">
          <span className="course-builder-sidebar-status">Не опубликован</span>
          <span className="course-builder-sidebar-status accent">
            Конструктор
          </span>
        </div>
      </div>

      <div className="course-builder-sidebar-actions">
        <button type="button" className="course-builder-sidebar-publish">
          Опубликовать
        </button>

        <p className="course-builder-sidebar-action-hint">
          Сначала соберите структуру курса, затем вернемся к публикации.
        </p>
      </div>

      <div className="course-builder-sidebar-group">
        <button
          type="button"
          className={`course-builder-sidebar-toggle${isCourseSectionActive ? " is-active" : ""}`}
          aria-expanded={isCourseMenuOpen}
          onClick={() => setIsCourseMenuOpen((value) => !value)}
        >
          <span>Курс</span>
          <span
            className={`course-builder-sidebar-caret${isCourseMenuOpen ? " is-open" : ""}`}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>

        {isCourseMenuOpen ? (
          <div className="course-builder-sidebar-subnav">
            <NavLink
              to="description"
              className={({ isActive }) =>
                `course-builder-sidebar-sublink${isActive ? " is-active" : ""}`
              }
            >
              Описание
            </NavLink>
            <Link
              to="syllabus"
            className={`course-builder-sidebar-sublink${isSyllabusActive ? " is-active" : ""}`}
            aria-current={isSyllabusActive ? "page" : undefined}
          >
            Содержание
          </Link>
        </div>
        ) : null}
      </div>
    </nav>
  );
}

export default CourseBuilderSidebar;
