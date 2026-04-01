import { Link } from "react-router";

function CoursePreviewCard({ course }) {
  return (
    <Link className="course-preview-card" to={`/courses/${course.id}`}>
      <div className="course-preview-card-head">
        <div className="course-preview-card-body">
          <p className="course-preview-card-author">{course.authorName}</p>
          <h3 className="course-preview-card-title">{course.title}</h3>
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
        <span>Рейтинг {course.rating}</span>
        <span>{course.studentsCount} студентов</span>
        <span>{course.durationLabel}</span>
      </div>
    </Link>
  );
}

export default CoursePreviewCard;
