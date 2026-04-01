import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { getCourseCoverSrc } from "../../model/getCourseCoverSrc";

function CompletedCourseCard({ course, onToggleFavouriteCourse }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const completedLessons = course.progress?.completedLessons ?? course.lessonsCount;
  const totalLessons = course.lessonsCount;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function navigateToCourse() {
    navigate(`/courses/${course.id}`);
  }

  function handleCardKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateToCourse();
    }
  }

  return (
    <article
      className="completed-course-card cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={navigateToCourse}
      onKeyDown={handleCardKeyDown}
    >
      <div
        className="completed-course-menu-wrap"
        ref={menuRef}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="completed-course-menu-btn"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        {isMenuOpen ? (
          <div className="completed-course-menu" role="menu">
            <button
              type="button"
              className="completed-course-menu-item"
              role="menuitem"
              onClick={() => {
                onToggleFavouriteCourse(course.id);
                setIsMenuOpen(false);
              }}
            >
              {course.isFavourite ? "Убрать из избранного" : "Добавить в избранное"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="completed-course-card-content">
        <img
          className="completed-course-card-img"
          src={getCourseCoverSrc(course)}
          alt="Обложка курса"
        />

        <div className="completed-course-card-body">
          <div className="completed-course-card-meta">
            <Link
              className="completed-course-card-title"
              to={`/courses/${course.id}`}
              onClick={(event) => event.stopPropagation()}
            >
              {course.title}
            </Link>

            <p className="completed-course-card-author">
              {course.authorName}
            </p>
          </div>

          <div className="completed-course-progress">
            <div className="completed-course-progress-head">
              <span>Прогресс</span>
              <span>
                {completedLessons} / {totalLessons} уроков
              </span>
              <span>Завершен</span>
            </div>

            <div className="completed-course-progress-row">
              <div
                className="completed-course-progressbar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={totalLessons}
                aria-valuenow={completedLessons}
                aria-label="Прогресс по курсу"
              >
                <div
                  className="completed-course-progressbar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <button
                type="button"
                className="completed-course-review-btn"
                onClick={(event) => event.stopPropagation()}
              >
                Оставить отзыв
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CompletedCourseCard;
