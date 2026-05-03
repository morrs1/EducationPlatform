import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router";
import { selectIsLogged, openLoginModal } from "../../../features/auth";
import {
  hydrateCompletedLessonsFromLearningService,
  selectCompletedLessonIds,
  selectViewedLessonIds,
} from "../../../features/lesson-session";
import {
  completeViewerCourseWithLearningService,
  createViewerCourseSnapshot,
  enrollViewerInCourseWithLearningService,
  upsertViewerCourseSnapshot,
  selectIsCompletedCourse,
  selectIsFavouriteCourse,
  selectIsEnrolledInCourse,
  selectCanViewCourseContent,
  selectViewerCourseById,
  selectViewerCourseProgress,
  toggleFavouriteCourse,
} from "../../../features/viewer";
import { requestViewerDisplayProfileById } from "../../../shared/api/userServiceApi";
import { getLessonProgressMap } from "../../../entities/lesson";
import { CourseTabs } from "../../../widgets/course-tabs";
import { CourseSidebar } from "../../../widgets/course-sidebar";
import { CourseDescriptionTab } from "../../../widgets/course-description";
import { CourseContentTab } from "../../../widgets/course-content";
import { CourseReviewsTab } from "../../../widgets/course-reviews";
import { getCoursePageData } from "../lib/getCoursePageData";
import { getCourseDescriptionMarkdown } from "../lib/getCourseDescriptionMarkdown";
import { parseCourseDescriptionMarkdown } from "../lib/parseCourseDescriptionMarkdown";
import {
  isUuid,
  mapReadCourseByIdResponseToCoursePageData,
  requestCourseById,
  sanitizeCourseDisplayLabel,
} from "../../../entities/course";

const tabIds = ["description", "content", "reviews"];

function resolveActiveTab(searchParams) {
  const tab = searchParams.get("tab");
  return tabIds.includes(tab) ? tab : "description";
}

function CoursePage() {
  const { courseId: courseIdParam } = useParams();
  const numericCourseId = Number(courseIdParam);
  const isBackendCourseRoute = isUuid(courseIdParam);
  const resolvedCourseId = isBackendCourseRoute ? courseIdParam : numericCourseId;
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const isLogged = useSelector(selectIsLogged);
  const viewerCourse = useSelector((state) =>
    resolvedCourseId != null &&
    (typeof resolvedCourseId === "string" || Number.isFinite(resolvedCourseId))
      ? selectViewerCourseById(state, resolvedCourseId)
      : null,
  );
  const isEnrolled = useSelector((state) =>
    resolvedCourseId != null
      ? selectIsEnrolledInCourse(state, resolvedCourseId)
      : false,
  );
  const isFavourite = useSelector((state) =>
    resolvedCourseId != null
      ? selectIsFavouriteCourse(state, resolvedCourseId)
      : false,
  );
  const isCompleted = useSelector((state) =>
    resolvedCourseId != null
      ? selectIsCompletedCourse(state, resolvedCourseId)
      : false,
  );
  const canViewContent = useSelector((state) =>
    resolvedCourseId != null
      ? selectCanViewCourseContent(state, resolvedCourseId)
      : false,
  );
  const viewerCourseProgress = useSelector((state) =>
    resolvedCourseId != null
      ? selectViewerCourseProgress(state, resolvedCourseId)
      : null,
  );
  const viewedLessonIds = useSelector(selectViewedLessonIds);
  const completedLessonIds = useSelector(selectCompletedLessonIds);

  const [mockDescriptionStatus, setMockDescriptionStatus] = useState("loading");
  const [mockDescriptionMarkdown, setMockDescriptionMarkdown] = useState("");
  const [descriptionRequestSeed, setDescriptionRequestSeed] = useState(0);
  const [backendPageStatus, setBackendPageStatus] = useState("idle");
  const [backendPageData, setBackendPageData] = useState(null);
  const [backendPageError, setBackendPageError] = useState("");
  const [backendRequestSeed, setBackendRequestSeed] = useState(0);
  const [learningActionError, setLearningActionError] = useState("");

  const enrichBackendCourseAuthor = useCallback(async (nextPageData) => {
    const authorId = nextPageData?.course?.authorId;

    if (!authorId) {
      return nextPageData;
    }

    try {
      const authorProfile = await requestViewerDisplayProfileById(authorId);

      if (!authorProfile?.name) {
        return nextPageData;
      }

      return {
        ...nextPageData,
        course: {
          ...nextPageData.course,
          authorName: authorProfile.name,
        },
      };
    } catch {
      return nextPageData;
    }
  }, []);

  useEffect(() => {
    if (!isBackendCourseRoute || !courseIdParam) {
      return;
    }

    let isCancelled = false;

    async function loadBackendCourse() {
      setBackendPageStatus("loading");
      setBackendPageError("");

      try {
        const response = await requestCourseById(courseIdParam);
        const nextPageData = await enrichBackendCourseAuthor(
          mapReadCourseByIdResponseToCoursePageData(
            response,
            courseIdParam,
          ),
        );

        if (!isCancelled) {
          setBackendPageData(nextPageData);
          setBackendPageStatus("success");
        }
      } catch (error) {
        if (!isCancelled) {
          setBackendPageData(null);
          setBackendPageStatus("error");
          setBackendPageError(
            error?.message ?? "Не удалось загрузить курс.",
          );
        }
      }
    }

    loadBackendCourse();

    return () => {
      isCancelled = true;
    };
  }, [
    courseIdParam,
    isBackendCourseRoute,
    backendRequestSeed,
    enrichBackendCourseAuthor,
  ]);

  const pageData = useMemo(() => {
    if (isBackendCourseRoute) {
      return backendPageData;
    }

    return getCoursePageData(numericCourseId);
  }, [backendPageData, isBackendCourseRoute, numericCourseId]);
  const syllabusLessonIds = useMemo(
    () =>
      (pageData?.syllabus?.modules ?? [])
        .flatMap((module) => module.lessons.map((lesson) => lesson.lessonId))
        .filter(Boolean),
    [pageData],
  );
  const backendCourseSnapshot = useMemo(
    () =>
      isBackendCourseRoute && pageData?.course
        ? createViewerCourseSnapshot(pageData.course, syllabusLessonIds)
        : null,
    [isBackendCourseRoute, pageData, syllabusLessonIds],
  );
  const course = useMemo(() => {
    if (isBackendCourseRoute) {
      if (!pageData?.course) {
        return null;
      }

      return {
        ...pageData.course,
        isEnrolled,
        isFavourite,
        isCompleted,
        progress: viewerCourseProgress,
      };
    }

    return viewerCourse ?? pageData?.course ?? null;
  }, [
    isBackendCourseRoute,
    pageData,
    isCompleted,
    isEnrolled,
    isFavourite,
    viewerCourse,
    viewerCourseProgress,
  ]);
  const activeTab = resolveActiveTab(searchParams);
  const isBackendCourse = Boolean(course?.isBackendCourse);
  const canUseCourseContent = canViewContent;
  const isContentAccessible = isLogged;
  const descriptionStatus = !course
    ? "error"
    : isBackendCourse
      ? "success"
      : mockDescriptionStatus;
  const descriptionMarkdown = !course
    ? ""
    : isBackendCourse
      ? course.description || ""
      : mockDescriptionMarkdown;

  useEffect(() => {
    if (!course || course.isBackendCourse) {
      return;
    }

    let isCancelled = false;

    async function loadDescription() {
      setMockDescriptionStatus("loading");

      try {
        const markdown = await getCourseDescriptionMarkdown(course.id);

        if (!isCancelled) {
          setMockDescriptionMarkdown(markdown);
          setMockDescriptionStatus("success");
        }
      } catch {
        if (!isCancelled) {
          setMockDescriptionMarkdown("");
          setMockDescriptionStatus("error");
        }
      }
    }

    loadDescription();

    return () => {
      isCancelled = true;
    };
  }, [course, descriptionRequestSeed]);

  useEffect(() => {
    if (!backendCourseSnapshot) {
      return;
    }

    dispatch(upsertViewerCourseSnapshot(backendCourseSnapshot));
  }, [backendCourseSnapshot, dispatch]);

  const descriptionBlocks = useMemo(
    () => parseCourseDescriptionMarkdown(descriptionMarkdown),
    [descriptionMarkdown],
  );
  const lessonProgressByLessonId = useMemo(
    () =>
      getLessonProgressMap(
        viewedLessonIds,
        completedLessonIds,
        syllabusLessonIds,
      ),
    [viewedLessonIds, completedLessonIds, syllabusLessonIds],
  );
  const completedSyllabusLessonIds = useMemo(
    () =>
      syllabusLessonIds.filter((lessonId) => {
        const progress = lessonProgressByLessonId[lessonId];

        return progress?.isCompleted;
      }),
    [lessonProgressByLessonId, syllabusLessonIds],
  );

  useEffect(() => {
    if (
      !isBackendCourseRoute ||
      !isLogged ||
      !canUseCourseContent ||
      !resolvedCourseId ||
      !syllabusLessonIds.length
    ) {
      return;
    }

    dispatch(
      hydrateCompletedLessonsFromLearningService({
        courseId: resolvedCourseId,
        courseLessonIds: syllabusLessonIds,
      }),
    );
  }, [
    canUseCourseContent,
    dispatch,
    isBackendCourseRoute,
    isLogged,
    resolvedCourseId,
    syllabusLessonIds,
  ]);

  useEffect(() => {
    if (
      !isBackendCourseRoute ||
      !isLogged ||
      !isEnrolled ||
      isCompleted ||
      !course ||
      !syllabusLessonIds.length ||
      completedSyllabusLessonIds.length < syllabusLessonIds.length
    ) {
      return;
    }

    dispatch(
      completeViewerCourseWithLearningService({
        courseId: course.id,
        courseSnapshot: backendCourseSnapshot,
      }),
    );
  }, [
    backendCourseSnapshot,
    completedSyllabusLessonIds.length,
    course,
    dispatch,
    isBackendCourseRoute,
    isCompleted,
    isEnrolled,
    isLogged,
    syllabusLessonIds.length,
  ]);

  function handlePageRetry() {
    setBackendRequestSeed((value) => value + 1);
  }

  if (isBackendCourseRoute && backendPageStatus === "loading") {
    return (
      <div className="course-page">
        <section className="course-not-found">
          <p className="course-not-found-label">Загрузка курса</p>
          <h1 className="course-not-found-title">Загружаем курс</h1>
          <p className="course-not-found-text">
            Подготавливаем описание, программу и материалы курса.
          </p>
        </section>
      </div>
    );
  }

  if (isBackendCourseRoute && backendPageStatus === "error") {
    return (
      <div className="course-page">
        <section className="course-not-found">
          <p className="course-not-found-label">Ошибка загрузки</p>
          <h1 className="course-not-found-title">Не удалось получить курс</h1>
          <p className="course-not-found-text">
            {backendPageError || "Не удалось получить данные курса."}
          </p>
          <button
            type="button"
            className="course-inline-btn"
            onClick={handlePageRetry}
          >
            Повторить
          </button>
        </section>
      </div>
    );
  }

  if (!pageData || !course) {
    return (
      <div className="course-page">
        <section className="course-not-found">
          <p className="course-not-found-label">Ошибка навигации</p>
          <h1 className="course-not-found-title">Курс не найден</h1>
          <p className="course-not-found-text">
            Возможно, ссылка устарела или курс был удален из демо-данных.
          </p>
        </section>
      </div>
    );
  }

  function changeTab(tabId) {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (tabId === "description") {
      nextSearchParams.delete("tab");
    } else {
      nextSearchParams.set("tab", tabId);
    }

    setSearchParams(nextSearchParams);
  }

  async function handlePrimaryAction() {
    if (!isLogged) {
      dispatch(openLoginModal());
      return;
    }

    setLearningActionError("");

    if (!canViewContent) {
      const result = await dispatch(
        enrollViewerInCourseWithLearningService({
          courseId: course.id,
          courseSnapshot: backendCourseSnapshot,
        }),
      );

      if (!result?.ok) {
        setLearningActionError(
          result?.error ?? "Не удалось записаться на курс.",
        );
        return;
      }
    }

    changeTab("content");
  }

  function handleToggleFavourite() {
    if (!isLogged) {
      dispatch(openLoginModal());
      return;
    }

    dispatch(
      toggleFavouriteCourse({
        courseId: course.id,
        courseSnapshot: backendCourseSnapshot,
      }),
    );
  }

  function handleDescriptionRetry() {
    setDescriptionRequestSeed((value) => value + 1);
  }

  const tabs = [
    { id: "description", label: "Описание", isLocked: false },
    { id: "content", label: "Содержание", isLocked: !canUseCourseContent },
    { id: "reviews", label: "Отзывы", isLocked: false },
  ];

  return (
    <div className="course-page">
      <aside className="course-page-nav-rail">
        <CourseTabs tabs={tabs} activeTab={activeTab} onTabChange={changeTab} />
      </aside>

      <div className="course-page-main">
        <section className="course-hero">
          <div className="course-hero-copy">
            <p className="course-hero-eyebrow">
              {sanitizeCourseDisplayLabel(course.categoryName)} /{" "}
              {sanitizeCourseDisplayLabel(
                course.subcategoryName,
                "Описание структуры",
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

          {learningActionError ? (
            <p className="course-not-found-text">{learningActionError}</p>
          ) : null}
        </section>

        {activeTab === "description" ? (
          <CourseDescriptionTab
            status={descriptionStatus}
            blocks={descriptionBlocks}
            onRetry={handleDescriptionRetry}
          />
        ) : null}

        {activeTab === "content" ? (
          <CourseContentTab
            course={course}
            syllabus={pageData.syllabus}
            isLogged={isContentAccessible}
            canViewContent={canUseCourseContent}
            lessonProgressByLessonId={
              canUseCourseContent ? lessonProgressByLessonId : {}
            }
            onLogin={() => dispatch(openLoginModal())}
            onEnroll={handlePrimaryAction}
          />
        ) : null}

        {activeTab === "reviews" ? (
          <CourseReviewsTab reviews={pageData.reviews} />
        ) : null}
      </div>

      <aside className="course-page-sidebar-rail">
        <CourseSidebar
          course={course}
          isLogged={isContentAccessible}
          onPrimaryAction={handlePrimaryAction}
          onToggleFavourite={handleToggleFavourite}
        />
      </aside>
    </div>
  );
}

export default CoursePage;
