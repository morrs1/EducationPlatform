import {
  formatCourseTagLabel,
  sanitizeCourseDisplayLabel,
} from "../../../entities/course";
import { AuthorLink } from "../../../shared/ui";
import { isUuid, normalizeText } from "../../../shared/lib/gatewayValues";

function CourseHero({
  course,
  error,
  tagLabels,
  viewerCanOpenAuthorProfile = false,
  onAuthorProfileAuthRequired,
}) {
  const hasTagPills = tagLabels.length > 0;
  const authorId = normalizeText(course.authorId);
  const showAuthor = isUuid(authorId);

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
        <span className="course-hero-meta-author">
          {showAuthor ? (
            <>
              Автор:{" "}
              <AuthorLink
                authorId={authorId}
                authorName={course.authorName}
                className="course-hero-meta-author-link"
                viewerCanOpenAuthorProfile={viewerCanOpenAuthorProfile}
                onAuthorProfileAuthRequired={onAuthorProfileAuthRequired}
              />
            </>
          ) : (
            "Автор пока недоступен"
          )}
        </span>
      </div>

      {error ? <p className="course-not-found-text">{error}</p> : null}
    </section>
  );
}

export default CourseHero;
