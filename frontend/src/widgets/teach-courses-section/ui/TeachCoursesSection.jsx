import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import {
  mapReadCourseByIdResponseToCoursePageData,
  requestAllCourses,
  sanitizeCourseDisplayLabel,
} from "../../../entities/course";
import { CourseDisplayCover } from "../../../entities/course";
import { selectCurrentViewerId } from "../../../features/auth";
import {
  resolveCourseServiceAuthorId,
  selectViewer,
} from "../../../features/viewer";

function TeachCoursesSection() {
  const currentViewerId = useSelector(selectCurrentViewerId);
  const viewer = useSelector(selectViewer);
  const [backendStatus, setBackendStatus] = useState("idle");
  const [backendCourses, setBackendCourses] = useState([]);
  const [backendError, setBackendError] = useState("");
  const authorId = useMemo(
    () => resolveCourseServiceAuthorId(currentViewerId, viewer.remoteId),
    [currentViewerId, viewer.remoteId],
  );
  const localSnapshotCourses = useMemo(
    () =>
      Object.values(viewer.courseSnapshotsById)
        .filter(
          (course) => course.isBackendCourse && course.authorId === authorId,
        )
        .sort((left, right) => left.title.localeCompare(right.title, "ru")),
    [authorId, viewer.courseSnapshotsById],
  );

  useEffect(() => {
    if (!authorId) {
      return;
    }

    let isCancelled = false;

    async function loadBackendCourses() {
      setBackendStatus("loading");
      setBackendError("");

      try {
        const response = await requestAllCourses();
        const snapshotBySignature = new Map(
          localSnapshotCourses.map((course) => [
            `${course.authorId}::${course.title.toLowerCase()}`,
            course,
          ]),
        );
        const backendCoursesById = new Map();
        const backendCourseSignatures = new Set();

        response.forEach((courseResponse) => {
          const pageData = mapReadCourseByIdResponseToCoursePageData(
            courseResponse,
            "",
          );
          const backendCourse = pageData.course;
          const signature = `${backendCourse.authorId}::${backendCourse.title.toLowerCase()}`;

          backendCourseSignatures.add(signature);

          const snapshotMatch = snapshotBySignature.get(signature);
          const resolvedId = backendCourse.id || snapshotMatch?.id || "";

          if (!resolvedId) {
            return;
          }

          backendCoursesById.set(String(resolvedId), {
            ...snapshotMatch,
            ...backendCourse,
            id: resolvedId,
            coverUrl: backendCourse.coverUrl || snapshotMatch?.coverUrl || "",
            imageUrl: backendCourse.imageUrl || snapshotMatch?.imageUrl || "",
          });
        });

        const nextCourses = [
          ...backendCoursesById.values(),
          ...localSnapshotCourses.filter((course) => {
            const signature = `${course.authorId}::${course.title.toLowerCase()}`;

            return (
              backendCourseSignatures.has(signature) &&
              !backendCoursesById.has(String(course.id))
            );
          }),
        ]
          .filter(
            (course) =>
              course && course.isBackendCourse && course.authorId === authorId,
          )
          .sort((left, right) => left.title.localeCompare(right.title, "ru"));

        if (!isCancelled) {
          setBackendCourses(nextCourses);
          setBackendStatus("success");
        }
      } catch (error) {
        if (!isCancelled) {
          setBackendCourses([]);
          setBackendStatus("error");
          setBackendError(
            error?.message ??
              "Не удалось загрузить список курсов.",
          );
        }
      }
    }

    loadBackendCourses();

    return () => {
      isCancelled = true;
    };
  }, [authorId, localSnapshotCourses]);

  const authoredCourses =
    backendStatus === "success" ? backendCourses : localSnapshotCourses;

  if (backendStatus === "loading") {
    return (
      <section className="teach-courses-section">
        <div className="teach-courses-section-empty-state">
          <strong className="teach-courses-section-empty-title">
            Загружаем ваши курсы
          </strong>
          <p className="teach-courses-section-empty">
            Подготавливаем список курсов.
          </p>
        </div>
      </section>
    );
  }

  if (!authoredCourses.length) {
    return (
      <section className="teach-courses-section">
        <div className="teach-courses-section-empty-state">
          <strong className="teach-courses-section-empty-title">
            У вас пока нет курсов
          </strong>
          {backendStatus === "error" ? (
            <p className="teach-courses-section-empty">{backendError}</p>
          ) : null}
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
                      {sanitizeCourseDisplayLabel(
                        course.categoryName,
                        "Курс преподавателя",
                      )}
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
