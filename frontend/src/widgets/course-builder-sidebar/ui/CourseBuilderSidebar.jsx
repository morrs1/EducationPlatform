import { useState } from "react";
import { Link, NavLink, useLocation, useResolvedPath } from "react-router";
import { CourseDisplayCover } from "../../../entities/course";

function CourseBuilderSidebar({
  course,
  pageStatus,
  onPublishCourse,
  publishStatus = "idle",
  publishError = "",
  canPublishCourse = false,
}) {
  const location = useLocation();
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
  const resolvedCourseTitle =
    course?.title ||
    (pageStatus === "loading" ? "Загрузка курса" : "Курс пока не найден");
  const resolvedDescription =
    course?.shortDescription ||
    (pageStatus === "loading"
      ? "Загружаем сведения о курсе."
      : "Короткое описание появится после загрузки курса.");
  const lessonsCount = Number(course?.lessonsCount) || 0;
  const durationLabel = course?.durationLabel || "Длительность уточняется";
  const isPublishing = publishStatus === "loading";
  const isPublished = Boolean(course?.isPublished);
  const publishButtonLabel = isPublished
    ? "Опубликован"
    : isPublishing
      ? "Публикуем"
      : "Опубликовать";

  return (
    <nav className="course-builder-sidebar" aria-label="Навигация по курсу">
      <div className="course-builder-sidebar-summary">
        <CourseDisplayCover
          title={resolvedCourseTitle}
          coverUrl={course?.coverUrl}
          imageUrl={course?.imageUrl}
          variant="sidebar"
        />

        <div className="course-builder-sidebar-summary-copy">
          <span className="course-builder-sidebar-kicker">WORKSPACE</span>
          <strong className="course-builder-sidebar-course-title">
            {resolvedCourseTitle}
          </strong>
          <p className="course-builder-sidebar-course-description">
            {resolvedDescription}
          </p>

          <div className="course-builder-sidebar-statuses">
            <span className="course-builder-sidebar-status">
              {isPublished ? "Опубликован" : "Черновик"}
            </span>
          </div>

          <div className="course-builder-sidebar-summary-meta">
            <span>{durationLabel}</span>
            <span>Уроков: {lessonsCount}</span>
          </div>
        </div>
      </div>

      <div className="course-builder-sidebar-actions">
        <button
          type="button"
          className="course-builder-sidebar-publish"
          disabled={!canPublishCourse || isPublishing}
          onClick={onPublishCourse}
        >
          {publishButtonLabel}
        </button>
        {publishError ? (
          <p className="course-builder-sidebar-action-hint">{publishError}</p>
        ) : null}
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
