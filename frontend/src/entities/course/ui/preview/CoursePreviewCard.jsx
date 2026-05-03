import { Link } from "react-router";
import { sanitizeCourseDisplayLabel } from "../../model/courseDisplayLabels";

function CoursePreviewCard({ course }) {
  const levelLabelMap = {
    beginner: "Для начинающих",
    intermediate: "Средний уровень",
    advanced: "Продвинутый",
  };
  const levelLabel = levelLabelMap[course.level] ?? "Любой уровень";
  const ratingLabel =
    typeof course.rating === "number" && course.rating > 0
      ? `Рейтинг ${course.rating}`
      : "Рейтинг появится";
  const studentsLabel =
    typeof course.studentsCount === "number" && course.studentsCount > 0
      ? `${course.studentsCount} студентов`
      : "Новый курс";
  const categoryLabel = sanitizeCourseDisplayLabel(course.categoryName);

  return (
    <Link className="course-preview-card" to={`/courses/${course.id}`}>
      <div className="course-preview-card-badges">
        <span className="course-preview-card-badge">{categoryLabel}</span>
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
                {categoryLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="course-preview-card-meta">
        <span className="course-preview-card-meta-pill">{ratingLabel}</span>
        <span className="course-preview-card-meta-pill">{studentsLabel}</span>
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
