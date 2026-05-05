import { Link } from "react-router";
import {
  formatCourseTagLabel,
  sanitizeCourseDisplayLabel,
} from "../../model/courseDisplayLabels";

function CoursePreviewCard({ course }) {
  const levelLabelMap = {
    beginner: "Начальный уровень",
    intermediate: "Продвинутый уровень",
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
  const tagLabels = Array.isArray(course.tags)
    ? course.tags
        .map((label) => formatCourseTagLabel(label))
        .filter(Boolean)
    : [];
  const fromTags = tagLabels.length > 0;
  const visibleTags = fromTags ? tagLabels : [categoryLabel];
  const overflowTagCount =
    visibleTags.length > 3 ? visibleTags.length - 3 : 0;

  return (
    <Link className="course-preview-card" to={`/courses/${course.id}`}>
      <div className="course-preview-card-badges">
        {visibleTags.slice(0, 3).map((label, index) => (
          <span
            key={`${label}-${index}`}
            className="course-preview-card-badge"
          >
            {fromTags
              ? formatCourseTagLabel(label) || "—"
              : sanitizeCourseDisplayLabel(label)}
          </span>
        ))}
        {overflowTagCount > 0 ? (
          <span className="course-preview-card-badge course-preview-card-badge-more">
            +{overflowTagCount}
          </span>
        ) : null}
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
                {fromTags
                  ? formatCourseTagLabel(visibleTags[0]) || "—"
                  : sanitizeCourseDisplayLabel(
                      visibleTags[0] ?? categoryLabel,
                    )}
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
