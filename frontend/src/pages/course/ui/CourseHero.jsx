import {
  formatCourseTagLabel,
  sanitizeCourseDisplayLabel,
} from "../../../entities/course";

function CourseHero({ course, error, tagLabels }) {
  const hasTagPills = tagLabels.length > 0;

  return (
    <section className="course-hero">
      <div className="course-hero-copy">
        {hasTagPills ? (
          <ul className="course-hero-tags" aria-label="Теги курса">
            {tagLabels.map((label, index) => (
              <li key={`${label}-${index}`}>
                <span className="course-hero-tag-pill">
                  {formatCourseTagLabel(label) || "—"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="course-hero-eyebrow">
          {hasTagPills ? (
            sanitizeCourseDisplayLabel(
              course.subcategoryName,
              "Уровень и метаданные",
            )
          ) : (
            <>
              {sanitizeCourseDisplayLabel(course.categoryName)} /{" "}
              {sanitizeCourseDisplayLabel(
                course.subcategoryName,
                "Описание структуры",
              )}
            </>
          )}
        </p>
        <h1 className="course-hero-title">{course.title}</h1>
        <p className="course-hero-description">{course.shortDescription}</p>
      </div>

      <div className="course-hero-meta">
        <span>
          {course.authorName
            ? `Автор: ${course.authorName}`
            : "Автор пока недоступен"}
        </span>
        <span>
          {course.rating == null
            ? "Рейтинг пока недоступен"
            : `Рейтинг ${course.rating}`}
        </span>
        <span>
          {course.studentsCount == null
            ? "Статистика студентов пока недоступна"
            : `${course.studentsCount} студентов`}
        </span>
      </div>

      {error ? <p className="course-not-found-text">{error}</p> : null}
    </section>
  );
}

export default CourseHero;
