import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import CourseDisplayCover from "../../../entities/course/ui/CourseDisplayCover";
import { selectCurrentViewerId } from "../../../features/auth";
import {
  resolveCourseServiceAuthorId,
  selectViewer,
} from "../../../features/viewer";

function TeachCoursesSection() {
  const currentViewerId = useSelector(selectCurrentViewerId);
  const viewer = useSelector(selectViewer);
  const authorId = useMemo(
    () => resolveCourseServiceAuthorId(currentViewerId, viewer.remoteId),
    [currentViewerId, viewer.remoteId],
  );
  const authoredCourses = useMemo(
    () =>
      Object.values(viewer.courseSnapshotsById)
        .filter(
          (course) => course.isBackendCourse && course.authorId === authorId,
        )
        .sort((left, right) => left.title.localeCompare(right.title, "ru")),
    [authorId, viewer.courseSnapshotsById],
  );

  if (!authoredCourses.length) {
    return (
      <section className="teach-courses-section">
        <div className="teach-courses-section-empty-state">
          <strong className="teach-courses-section-empty-title">
            У вас пока нет курсов
          </strong>
        </div>
      </section>
    );
  }

  return (
    <section className="teach-courses-section teach-courses-section-list-mode">
      <div className="teach-courses-section-list-head">
        <span className="teach-panel-kicker">ПРЕПОДАВАНИЕ</span>
        <h1 className="teach-panel-title">Ваши курсы</h1>
      </div>

      <div className="teach-courses-grid">
        {authoredCourses.map((course) => (
          <article key={course.id} className="teach-course-card">
            <CourseDisplayCover
              title={course.title}
              coverUrl={course.coverUrl}
              imageUrl={course.imageUrl}
              variant="card"
            />

            <div className="teach-course-card-body">
              <div className="teach-course-card-head">
                <div className="teach-course-card-copy">
                  <div className="teach-course-card-statuses">
                    <span className="teach-course-card-status primary">
                      Черновик
                    </span>
                    <span className="teach-course-card-status">
                      {course.categoryName || "Курс преподавателя"}
                    </span>
                  </div>

                  <strong className="teach-course-card-title">
                    {course.title}
                  </strong>
                </div>

                <div className="teach-course-card-meta">
                  <span>{course.durationLabel}</span>
                  <span>Уроков: {course.lessonsCount}</span>
                </div>
              </div>

              <p className="teach-course-card-text">
                {course.shortDescription ||
                  "Короткое описание пока не указано."}
              </p>

              <div className="teach-course-card-actions">
                <Link
                  to={`/course/${course.id}/syllabus`}
                  className="teach-course-card-link primary"
                >
                  Открыть конструктор
                </Link>
                <Link
                  to={`/courses/${course.id}`}
                  className="teach-course-card-link"
                >
                  Посмотреть курс
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TeachCoursesSection;
