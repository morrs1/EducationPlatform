import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { getCourseCoverSrc } from "../../model/getCourseCoverSrc";

function FavouriteCourseCard({ course, onToggleFavouriteCourse }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

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
      className="favourite-course-card cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={navigateToCourse}
      onKeyDown={handleCardKeyDown}
    >
      <div
        className="favourite-course-menu-wrap"
        ref={menuRef}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="favourite-course-menu-btn"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        {isMenuOpen ? (
          <div className="favourite-course-menu" role="menu">
            <button
              type="button"
              className="favourite-course-menu-item"
              role="menuitem"
              onClick={() => {
                onToggleFavouriteCourse(course.id);
                setIsMenuOpen(false);
              }}
            >
              Убрать из избранного
            </button>
          </div>
        ) : null}
      </div>

      <div className="favourite-course-card-content">
        <img
          className="favourite-course-card-img"
          src={getCourseCoverSrc(course)}
          alt="Обложка курса"
        />

        <div className="favourite-course-card-body">
          <div className="favourite-course-card-meta">
            <Link
              className="favourite-course-card-title"
              to={`/courses/${course.id}`}
              onClick={(event) => event.stopPropagation()}
            >
              {course.title}
            </Link>

            <p className="favourite-course-card-author">
              {course.authorName}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default FavouriteCourseCard;
