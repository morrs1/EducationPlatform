import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CoursePreviewCard } from "../../../entities/course";
import {
  openLoginModal,
  selectIsLogged,
  setPostLoginRedirect,
} from "../../../features/auth";
import {
  ALL_TAG_KEY,
  getCatalogCoursesForTagKey,
} from "../../../features/catalog";

const COURSES_PER_PAGE = 6;

function OurCoursesSection({ allCourses, catalogTagModel }) {
  const dispatch = useDispatch();
  const isLogged = useSelector(selectIsLogged);
  const [activeTagKey, setActiveTagKey] = useState(ALL_TAG_KEY);
  const [currentPage, setCurrentPage] = useState(0);
  const [animationDirection, setAnimationDirection] = useState("reset");

  const tagList = catalogTagModel?.tagList ?? [];
  const hasActiveTag =
    activeTagKey === ALL_TAG_KEY ||
    tagList.some((tag) => tag.key === activeTagKey);
  const resolvedActiveTagKey = hasActiveTag ? activeTagKey : ALL_TAG_KEY;
  const effectiveCurrentPage = currentPage;

  const courseById = new Map(
    (Array.isArray(allCourses) ? allCourses : []).map((course) => [
      course.id,
      course,
    ]),
  );
  const activeCourseRows = getCatalogCoursesForTagKey(
    catalogTagModel,
    resolvedActiveTagKey,
  );
  const activeTagCourses = activeCourseRows
    .map((row) => courseById.get(row.id))
    .filter(Boolean);
  const totalPages = Math.max(
    1,
    Math.ceil(activeTagCourses.length / COURSES_PER_PAGE),
  );
  const safeCurrentPage = Math.min(effectiveCurrentPage, totalPages - 1);
  const visibleCourses = activeTagCourses.slice(
    safeCurrentPage * COURSES_PER_PAGE,
    safeCurrentPage * COURSES_PER_PAGE + COURSES_PER_PAGE,
  );

  function handleTagChange(tagKey) {
    setActiveTagKey(tagKey);
    setCurrentPage(0);
    setAnimationDirection("reset");
  }

  function handlePreviousPage() {
    if (safeCurrentPage === 0) {
      return;
    }

    setAnimationDirection("backward");
    setCurrentPage((page) => Math.max(page - 1, 0));
  }

  function handleNextPage() {
    if (safeCurrentPage >= totalPages - 1) {
      return;
    }

    setAnimationDirection("forward");
    setCurrentPage((page) => Math.min(page + 1, totalPages - 1));
  }

  return (
    <section className="home-section">
      <div className="home-section-header">
        <div className="home-section-heading">
          <p className="home-section-eyebrow">Теги курсов</p>
          <h2 className="home-section-title">Наши курсы</h2>
        </div>

        <p className="home-section-description">
          Переключайтесь между тегами и просматривайте подборки курсов.
        </p>

        <div className="home-section-controls">
          <span className="home-section-page-indicator">
            {safeCurrentPage + 1} / {totalPages}
          </span>

          <div className="home-section-nav">
            <button
              type="button"
              className="home-section-nav-btn"
              onClick={handlePreviousPage}
              disabled={safeCurrentPage === 0}
              aria-label="Показать предыдущие курсы"
            >
              ←
            </button>

            <button
              type="button"
              className="home-section-nav-btn"
              onClick={handleNextPage}
              disabled={safeCurrentPage >= totalPages - 1}
              aria-label="Показать следующие курсы"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="home-category-tabs">
        <button
          type="button"
          onClick={() => handleTagChange(ALL_TAG_KEY)}
          className={`home-category-tab ${
            resolvedActiveTagKey === ALL_TAG_KEY ? "active" : ""
          }`}
        >
          Все
        </button>
        {tagList.map((tag) => {
          const isActive = tag.key === resolvedActiveTagKey;

          return (
            <button
              key={tag.key}
              type="button"
              onClick={() => handleTagChange(tag.key)}
              className={`home-category-tab ${isActive ? "active" : ""}`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      <div className="home-courses-viewport">
        <div
          key={`${resolvedActiveTagKey}-${safeCurrentPage}`}
          className={`home-courses-grid is-${animationDirection}`}
        >
          {visibleCourses.map((course) => (
            <CoursePreviewCard
              key={course.id}
              course={course}
              viewerCanOpenAuthorProfile={isLogged}
              onAuthorProfileAuthRequired={(requestedAuthorId) => {
                dispatch(setPostLoginRedirect(`/users/${requestedAuthorId}`));
                dispatch(openLoginModal());
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default OurCoursesSection;
