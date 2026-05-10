import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router";
import {
  selectCurrentViewerId,
  selectIsLogged,
  selectUserRole,
  openLoginModal,
} from "../../../features/auth";
import {
  selectCompletedLessonIds,
  selectViewedLessonIds,
} from "../../../features/lesson-session";
import {
  enrollViewerInCourseWithLearningService,
  resolveCourseServiceAuthorId,
  selectIsCompletedCourse,
  selectIsEnrolledInCourse,
  selectCanViewCourseContent,
  selectViewerCourseById,
  selectViewerCourseProgress,
  selectViewer,
} from "../../../features/viewer";
import { getLessonProgressMap } from "../../../entities/lesson";
import { CourseTabs } from "../../../widgets/course-tabs";
import { CourseSidebar } from "../../../widgets/course-sidebar";
import { CourseDescriptionTab } from "../../../widgets/course-description";
import { CourseContentTab } from "../../../widgets/course-content";
import { CourseReviewsTab } from "../../../widgets/course-reviews";
import { useBackendCoursePageData } from "../model/useBackendCoursePageData";
import { useCourseDescription } from "../model/useCourseDescription";
import { useCourseLearningSync } from "../model/useCourseLearningSync";
import {
  formatCourseTagLabel,
  getCoursePageData,
} from "../../../entities/course";
import { isUuid } from "../../../shared/lib";
import { createViewerCourseSnapshot } from "../../../entities/viewer";
import CourseHero from "./CourseHero";
import CoursePageState from "./CoursePageState";

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
  const userRole = useSelector(selectUserRole);
  const currentViewerId = useSelector(selectCurrentViewerId);
  const viewer = useSelector(selectViewer);
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
  const courseServiceAuthorId = useMemo(
    () => resolveCourseServiceAuthorId(currentViewerId, viewer.remoteId),
    [currentViewerId, viewer.remoteId],
  );

  const {
    status: backendPageStatus,
    pageData: backendPageData,
    error: backendPageError,
    retry: retryBackendPageRequest,
  } = useBackendCoursePageData({
    courseId: courseIdParam,
    enabled: isBackendCourseRoute,
  });
  const [learningActionError, setLearningActionError] = useState("");

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
    viewerCourse,
    viewerCourseProgress,
  ]);

  const courseTagLabels = useMemo(() => {
    if (!Array.isArray(course?.tags)) {
      return [];
    }

    return course.tags
      .map((label) => formatCourseTagLabel(label))
      .filter(Boolean);
  }, [course]);

  const activeTab = resolveActiveTab(searchParams);
  const isBackendCourse = Boolean(course?.isBackendCourse);
  const isAdmin = userRole === "ADMIN";
  const isOwnBackendCourse =
    isBackendCourse && course?.authorId === courseServiceAuthorId;
  const canManageDraftCourse = isOwnBackendCourse && !course?.isPublished;
  const canUseCourseContent =
    canManageDraftCourse ||
    canViewContent ||
    isOwnBackendCourse ||
    (isAdmin && isBackendCourse && course?.isDraft);
  const isContentAccessible = isLogged;
  const {
    blocks: descriptionBlocks,
    status: descriptionStatus,
    retry: retryDescriptionRequest,
  } = useCourseDescription(course);
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

  useCourseLearningSync({
    backendCourseSnapshot,
    canUseCourseContent,
    completedSyllabusLessonIds,
    course,
    isBackendCourseRoute,
    isCompleted,
    isEnrolled,
    isLogged,
    resolvedCourseId,
    syllabusLessonIds,
  });

  function handlePageRetry() {
    retryBackendPageRequest();
  }

  if (isBackendCourseRoute && backendPageStatus === "loading") {
    return (
      <CoursePageState
        label="Загрузка курса"
        title="Загружаем курс"
        text="Подготавливаем описание, программу и материалы курса."
      />
    );
  }

  if (isBackendCourseRoute && backendPageStatus === "error") {
    return (
      <CoursePageState
        label="Ошибка загрузки"
        title="Не удалось получить курс"
        text={backendPageError || "Не удалось получить данные курса."}
        action="Повторить"
        onAction={handlePageRetry}
      />
    );
  }

  if (!pageData || !course) {
    return (
      <CoursePageState
        label="Ошибка навигации"
        title="Курс не найден"
        text="Возможно, ссылка устарела или курс был удален из демо-данных."
      />
    );
  }

  if (isBackendCourse && course.isDraft && !isOwnBackendCourse && !isAdmin) {
    return (
      <CoursePageState
        label="Курс недоступен"
        title="Курс не найден"
        text="Возможно, ссылка устарела или курс пока не опубликован."
      />
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

    if (!canUseCourseContent) {
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

  function handleDescriptionRetry() {
    retryDescriptionRequest();
  }

  const sidebarCourse = canManageDraftCourse
    ? {
        ...course,
        isReadOnlyCourse: true,
        isEnrolled: true,
      }
    : isAdmin && isBackendCourse && course.isDraft
      ? {
          ...course,
          isReadOnlyCourse: true,
          isEnrolled: true,
        }
    : course;
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
        <CourseHero
          course={course}
          error={learningActionError}
          tagLabels={courseTagLabels}
        />

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
          course={sidebarCourse}
          isLogged={isContentAccessible}
          onPrimaryAction={handlePrimaryAction}
        />
      </aside>
    </div>
  );
}

export default CoursePage;
