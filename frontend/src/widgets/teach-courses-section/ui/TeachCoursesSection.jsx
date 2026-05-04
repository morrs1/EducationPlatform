import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import {
  mapReadCourseByIdResponseToCoursePageData,
  requestDraftCoursesByAuthor,
  requestPublishedCoursesByAuthor,
  sanitizeCourseDisplayLabel,
} from "../../../entities/course";
import { CourseDisplayCover } from "../../../entities/course";
import { selectCurrentViewerId } from "../../../features/auth";
import {
  resolveCourseServiceAuthorId,
  selectViewer,
} from "../../../features/viewer";

const sectionConfig = {
  published: {
    title: "Опубликованные курсы",
    emptyTitle: "Опубликованных курсов пока нет",
    emptyText: "Здесь появятся курсы, которые уже видны студентам.",
    loadingTitle: "Загружаем опубликованные курсы",
    statusLabel: "Опубликован",
    request: requestPublishedCoursesByAuthor,
  },
  drafts: {
    title: "Черновики",
    emptyTitle: "Черновиков пока нет",
    emptyText: "Создайте курс, чтобы собрать программу и материалы.",
    loadingTitle: "Загружаем черновики",
    statusLabel: "Черновик",
    request: requestDraftCoursesByAuthor,
  },
};

function normalizeCourseForSection(course, viewerName) {
  return {
    ...course,
    authorName: course.authorName || viewerName || "Автор курса",
  };
}

function TeachCourseCard({ course, variant }) {
  const isPublished = variant === "published";

  return (
    <article className="teach-course-card">
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
                {isPublished ? "Опубликован" : "Черновик"}
              </span>
              <span className="teach-course-card-status">
                {sanitizeCourseDisplayLabel(
                  course.categoryName,
                  "Курс преподавателя",
                )}
              </span>
            </div>

            <strong className="teach-course-card-title">{course.title}</strong>
          </div>

          <div className="teach-course-card-meta">
            <span>{course.durationLabel}</span>
            <span>Уроков: {course.lessonsCount}</span>
          </div>
        </div>

        <p className="teach-course-card-text">
          {course.shortDescription || "Короткое описание пока не указано."}
        </p>

        <div className="teach-course-card-actions">
          {!isPublished ? (
            <Link
              to={`/course/${course.id}/syllabus`}
              className="teach-course-card-link primary"
            >
              Открыть конструктор
            </Link>
          ) : null}

          <Link
            to={`/courses/${course.id}`}
            className={`teach-course-card-link${isPublished ? " primary" : ""}`}
          >
            Посмотреть курс
          </Link>
        </div>
      </div>
    </article>
  );
}

function TeachCoursesSection({ variant = "drafts" }) {
  const config = sectionConfig[variant] ?? sectionConfig.drafts;
  const currentViewerId = useSelector(selectCurrentViewerId);
  const viewer = useSelector(selectViewer);
  const viewerName =
    [viewer.lastName, viewer.firstName].filter(Boolean).join(" ").trim() ||
    viewer.name ||
    "";
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
          (course) =>
            course.isBackendCourse &&
            course.authorId === authorId &&
            (variant === "published"
              ? course.isPublished
              : !course.isPublished),
        )
        .sort((left, right) => left.title.localeCompare(right.title, "ru")),
    [authorId, variant, viewer.courseSnapshotsById],
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
        const response = await config.request(authorId);
        const nextCourses = response
          .map((courseResponse) =>
            mapReadCourseByIdResponseToCoursePageData(courseResponse, ""),
          )
          .map((pageData) => pageData.course)
          .filter(
            (course) =>
              course &&
              course.isBackendCourse &&
              course.authorId === authorId &&
              (variant === "published"
                ? course.isPublished
                : !course.isPublished),
          )
          .map((course) => normalizeCourseForSection(course, viewerName))
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
  }, [authorId, config, variant, viewerName]);

  const authoredCourses =
    backendStatus === "success"
      ? backendCourses
      : localSnapshotCourses.map((course) =>
          normalizeCourseForSection(course, viewerName),
        );

  if (backendStatus === "loading") {
    return (
      <section className="teach-courses-section">
        <div className="teach-courses-section-empty-state">
          <strong className="teach-courses-section-empty-title">
            Загружаем ваши курсы
          </strong>
          <p className="teach-courses-section-empty">
            {config.loadingTitle}.
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
            {config.emptyTitle}
          </strong>
          {backendStatus === "error" ? (
            <p className="teach-courses-section-empty">{backendError}</p>
          ) : (
            <p className="teach-courses-section-empty">{config.emptyText}</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="teach-courses-section teach-courses-section-list-mode">
      <div className="teach-courses-section-list-head">
        <span className="teach-panel-kicker">ПРЕПОДАВАНИЕ</span>
        <h1 className="teach-panel-title">{config.title}</h1>
      </div>

      <div className="teach-courses-grid">
        {authoredCourses.map((course) => (
          <TeachCourseCard key={course.id} course={course} variant={variant} />
        ))}
      </div>
    </section>
  );
}

export default TeachCoursesSection;
