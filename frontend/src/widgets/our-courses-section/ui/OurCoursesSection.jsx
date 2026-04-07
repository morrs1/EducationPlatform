import { useEffect, useState } from "react";
import CoursePreviewCard from "../../../entities/course/ui/preview/CoursePreviewCard";

const COURSES_PER_PAGE = 6;

function OurCoursesSection({ courseCategories, coursesByCategory }) {
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [animationDirection, setAnimationDirection] = useState("reset");

  const hasActiveCategory = courseCategories.some(
    (category) => category.id === activeCategoryId,
  );

  const resolvedActiveCategoryId = hasActiveCategory
    ? activeCategoryId
    : (courseCategories[0]?.id ?? null);

  const activeCategoryCourses = resolvedActiveCategoryId
    ? (coursesByCategory[resolvedActiveCategoryId] ?? [])
    : [];
  const totalPages = Math.max(
    1,
    Math.ceil(activeCategoryCourses.length / COURSES_PER_PAGE),
  );
  const visibleCourses = activeCategoryCourses.slice(
    currentPage * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE + COURSES_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(0);
    setAnimationDirection("reset");
  }, [resolvedActiveCategoryId]);

  function handleCategoryChange(categoryId) {
    setActiveCategoryId(categoryId);
    setAnimationDirection("reset");
  }

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
          <p className="home-section-eyebrow">Категории платформы</p>
          <h2 className="home-section-title">Наши курсы</h2>
        </div>

        <p className="home-section-description">
          Переключайтесь между направлениями и просматривайте подборки курсов
          в одном ритме, как на витрине каталога.
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
              aria-label="Показать предыдущие курсы"
            >
              ←
            </button>

            <button
              type="button"
              className="home-section-nav-btn"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              aria-label="Показать следующие курсы"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="home-category-tabs">
        {courseCategories.map((category) => {
          const isActive = category.id === resolvedActiveCategoryId;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryChange(category.id)}
              className={`home-category-tab ${isActive ? "active" : ""}`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      <div className="home-courses-viewport">
        <div
          key={`${resolvedActiveCategoryId}-${currentPage}`}
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

export default OurCoursesSection;
