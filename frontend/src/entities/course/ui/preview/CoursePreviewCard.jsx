import { Link } from "react-router";

function CoursePreviewCard({ course }) {
  const levelLabelMap = {
    beginner: "Новичкам",
    intermediate: "Средний уровень",
    advanced: "Продвинутый",
  };
  const levelLabel = levelLabelMap[course.level] ?? "Любой уровень";

  return (
    <Link className="course-preview-card" to={`/courses/${course.id}`}>
      <div className="course-preview-card-badges">
        <span className="course-preview-card-badge">{course.categoryName}</span>
        <span className="course-preview-card-level">{levelLabel}</span>
      </div>

      <div className="course-preview-card-head">
        <div className="course-preview-card-body">
          <p className="course-preview-card-author">{course.authorName}</p>
          <h3 className="course-preview-card-title">{course.title}</h3>
          <p className="course-preview-card-description">
            {course.shortDescription}
          </p>
        </div>

        <div className="course-preview-card-cover">
          {course.imageUrl ? (
            <img
              src={course.imageUrl}
              alt={course.title}
              className="course-preview-card-image"
            />
          ) : (
            <div className="course-preview-card-placeholder">
              <span className="course-preview-card-category">
                {course.categoryName}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="course-preview-card-meta">
        <span className="course-preview-card-meta-pill">
          Рейтинг {course.rating}
        </span>
        <span className="course-preview-card-meta-pill">
          {course.studentsCount} студентов
        </span>
        <span className="course-preview-card-meta-pill">
          {course.durationLabel}
        </span>
      </div>

      <div className="course-preview-card-cta">
        <span>Открыть курс</span>
        <span aria-hidden="true">-&gt;</span>
      </div>
    </Link>
  );
}

export default CoursePreviewCard;
