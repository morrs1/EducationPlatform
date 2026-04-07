import { useState } from "react";
import CoursePreviewCard from "../../../entities/course/ui/preview/CoursePreviewCard";

const COURSES_PER_PAGE = 6;

function PopularCoursesSection({ popularCourses }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [animationDirection, setAnimationDirection] = useState("reset");
  const totalPages = Math.max(
    1,
    Math.ceil(popularCourses.length / COURSES_PER_PAGE),
  );
  const visibleCourses = popularCourses.slice(
    currentPage * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE + COURSES_PER_PAGE,
  );

  function handlePreviousPage() {
    if (currentPage === 0) {
      return;
    }

    setAnimationDirection("backward");
    setCurrentPage((page) => Math.max(page - 1, 0));
  }

  function handleNextPage() {
    if (currentPage >= totalPages - 1) {
      return;
    }

    setAnimationDirection("forward");
    setCurrentPage((page) => Math.min(page + 1, totalPages - 1));
  }

  return (
    <section className="home-section">
      <div className="home-section-header">
        <div className="home-section-heading">
          <p className="home-section-eyebrow">Топ платформы</p>
          <h2 className="home-section-title">Популярные курсы</h2>
        </div>

        <p className="home-section-description">
          Первые 18 курсов по популярности среди всех направлений платформы.
        </p>

        <div className="home-section-controls">
          <span className="home-section-page-indicator">
            {currentPage + 1} / {totalPages}
          </span>

          <div className="home-section-nav">
            <button
              type="button"
              className="home-section-nav-btn"
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              aria-label="Показать предыдущие популярные курсы"
            >
              ←
            </button>

            <button
              type="button"
              className="home-section-nav-btn"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              aria-label="Показать следующие популярные курсы"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="home-courses-viewport">
        <div
          key={`popular-${currentPage}`}
          className={`home-courses-grid is-${animationDirection}`}
        >
          {visibleCourses.map((course) => (
            <CoursePreviewCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularCoursesSection;
