import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { getCourseCoverSrc } from "../../model/getCourseCoverSrc";

function CurrentCourseCard({
  course,
  onToggleFavouriteCourse,
  onLeaveCourse,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const completedLessons = course.progress?.completedLessons ?? 0;
  const totalLessons = course.lessonsCount;
  const progressPercent =
    course.progress?.progressPercent ??
    (totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);

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
      className="current-course-card cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={navigateToCourse}
      onKeyDown={handleCardKeyDown}
    >
      <div
        className="current-course-menu-wrap"
        ref={menuRef}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="current-course-menu-btn"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        {isMenuOpen ? (
          <div className="current-course-menu" role="menu">
            <button
              type="button"
              className="current-course-menu-item"
              role="menuitem"
              onClick={() => {
                onLeaveCourse(course.id);
                setIsMenuOpen(false);
              }}
            >
              Покинуть курс
            </button>

            <button
              type="button"
              className="current-course-menu-item"
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

      <div className="current-course-card-content">
        <img
          className="current-course-card-img"
          src={getCourseCoverSrc(course)}
          alt="Обложка курса"
        />

        <div className="current-course-card-body">
          <div className="current-course-card-meta">
            <Link
              className="current-course-card-title"
              to={`/courses/${course.id}`}
              onClick={(event) => event.stopPropagation()}
            >
              {course.title}
            </Link>

            <p className="current-course-card-author">
              {course.authorName}
            </p>
          </div>

          <div className="current-course-progress">
            <div className="current-course-progress-head">
              <span>Прогресс</span>
              <span>
                {completedLessons} / {totalLessons} уроков
              </span>
            </div>

            <div className="current-course-progress-row">
              <div
                className="current-course-progressbar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={totalLessons}
                aria-valuenow={completedLessons}
                aria-label="Прогресс по курсу"
              >
                <div
                  className="current-course-progressbar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <button
                type="button"
                className="current-course-review-btn"
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

export default CurrentCourseCard;
