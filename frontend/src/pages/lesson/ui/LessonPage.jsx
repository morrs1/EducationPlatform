import { useEffect, useMemo, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router";
import { createPortal } from "react-dom";

import {
  getLessonPageData,
  getLessonProgressMap,
} from "../../../entities/lesson";
import { getCourseSyllabus } from "../../../entities/course";
import { isUuid } from "../../../shared/lib";
import { useBackendLessonPageData } from "../model/useBackendLessonPageData";
import { useLessonAssistant } from "../model/useLessonAssistant";
import { useLessonCertificate } from "../model/useLessonCertificate";
import { useLessonContent } from "../model/useLessonContent";
import { CourseOutline } from "../../../widgets/course-outline";
import { LessonContentSection } from "../../../widgets/lesson-content-section";
import { AssistantPanel } from "../../../widgets/assistant-panel";

import {
  hydrateCompletedLessonsFromLearningService,
  openLesson,
  runCodeLesson,
  saveCodeDraft,
  selectCompletedLessonIds,
  selectLessonRunResult,
  saveChoiceDraft,
  saveTextDraft,
  selectLessonDraft,
  selectViewedLessonIds,
  selectLessonSubmission,
  submitLessonAnswer,
} from "../../../features/lesson-session";
import { selectCurrentViewerId } from "../../../features/auth";
import {
  resolveCourseServiceAuthorId,
  selectCanViewCourseContent,
  selectIsCompletedCourse,
  selectIsEnrolledInCourse,
  selectViewer,
} from "../../../features/viewer";
import CertificateDialog from "./CertificateDialog";

function getNavigableLessons(syllabus) {
  return (syllabus?.modules ?? []).flatMap((module) =>
    module.lessons
      .filter((lesson) => lesson.lessonId)
      .map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title,
      })),
  );
}

function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const numericCourseId = Number(courseId);
  const isBackendCourseRoute = isUuid(courseId);
  const isBackendLessonRoute = isBackendCourseRoute && isUuid(lessonId);
  const dispatch = useDispatch();
  const [isLessonNavigationPending, startLessonNavigationTransition] =
    useTransition();
  const {
    status: backendPageStatus,
    pageData: backendPageData,
    resolvedLessonId: backendResolvedLessonId,
    error: backendPageError,
    retry: retryBackendPageRequest,
  } = useBackendLessonPageData({
    courseId,
    lessonId,
    enabled: isBackendLessonRoute,
  });

  const pageData = useMemo(() => {
    if (isBackendLessonRoute) {
      return backendPageData;
    }

    return getLessonPageData(lessonId);
  }, [
    backendPageData,
    isBackendLessonRoute,
    lessonId,
  ]);

  const course = pageData?.course ?? null;
  const lesson = pageData?.lesson ?? null;
  const viewedLessonIds = useSelector(selectViewedLessonIds);
  const completedLessonIds = useSelector(selectCompletedLessonIds);
  const currentViewerId = useSelector(selectCurrentViewerId);
  const viewer = useSelector(selectViewer);
  const courseServiceAuthorId = useMemo(
    () => resolveCourseServiceAuthorId(currentViewerId, viewer.remoteId),
    [currentViewerId, viewer.remoteId],
  );
  const canViewContent = useSelector((state) =>
    course ? selectCanViewCourseContent(state, course.id) : false,
  );
  const isEnrolled = useSelector((state) =>
    course ? selectIsEnrolledInCourse(state, course.id) : false,
  );
  const isCompletedCourse = useSelector((state) =>
    course ? selectIsCompletedCourse(state, course.id) : false,
  );
  const lessonDraft = useSelector((state) =>
    lesson ? selectLessonDraft(state, lesson.id) : null,
  );
  const lessonSubmission = useSelector((state) =>
    lesson ? selectLessonSubmission(state, lesson.id) : null,
  );
  const lessonRunResult = useSelector((state) =>
    lesson ? selectLessonRunResult(state, lesson.id) : null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const isLessonViewed = lesson ? viewedLessonIds.includes(lesson.id) : false;
  const isLessonCompleted = lesson
    ? completedLessonIds.includes(lesson.id)
    : false;
  const isBackendCourse = Boolean(course?.isBackendCourse);
  const isOwnBackendCourse =
    isBackendCourse &&
    Boolean(course?.authorId) &&
    course.authorId === courseServiceAuthorId;
  const canUseCourseContent = isBackendCourse
    ? isEnrolled || isCompletedCourse || isOwnBackendCourse
    : canViewContent;

  const syllabus = useMemo(
    () =>
      isBackendLessonRoute
        ? pageData?.syllabus ?? null
        : course
          ? getCourseSyllabus(course.id)
          : null,
    [course, isBackendLessonRoute, pageData],
  );
  const syllabusLessonIds = useMemo(
    () =>
      (syllabus?.modules ?? [])
        .flatMap((module) => module.lessons.map((item) => item.lessonId))
        .filter(Boolean),
    [syllabus],
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
      syllabusLessonIds.filter((id) => {
        const progress = lessonProgressByLessonId[id];

        return progress?.isCompleted;
      }),
    [lessonProgressByLessonId, syllabusLessonIds],
  );
  const completedLessonsCount = completedSyllabusLessonIds.length;
  const courseProgressPercent = course?.lessonsCount
    ? Math.round((completedLessonsCount / course.lessonsCount) * 100)
    : 0;
  const { contentStatus, contentBlocks, contentError } =
    useLessonContent(lesson);
  const assistant = useLessonAssistant({ course, lesson });
  const navigableLessons = useMemo(
    () => getNavigableLessons(syllabus),
    [syllabus],
  );
  const currentLessonIndex = useMemo(
    () => navigableLessons.findIndex((item) => item.lessonId === lesson?.id),
    [lesson?.id, navigableLessons],
  );
  const previousLesson =
    currentLessonIndex > 0 ? navigableLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < navigableLessons.length - 1
      ? navigableLessons[currentLessonIndex + 1]
      : null;
  const isLastLesson = Boolean(navigableLessons.length) && nextLesson == null;
  const certificate = useLessonCertificate({
    course,
    isBackendCourse,
    isBackendLessonRoute,
    canUseCourseContent,
    isCompletedCourse,
    isEnrolled,
    isLastLesson,
    syllabusLessonIds,
    completedSyllabusLessonIds,
  });

  useEffect(() => {
    if (!lesson || !canUseCourseContent) {
      return;
    }

    dispatch(
      openLesson({
        lesson,
        courseId: course?.id ?? null,
        courseLessonIds: syllabusLessonIds,
      }),
    );
  }, [
    canUseCourseContent,
    course?.id,
    dispatch,
    isCompletedCourse,
    isEnrolled,
    lesson,
    syllabusLessonIds,
  ]);

  useEffect(() => {
    if (
      !isBackendLessonRoute ||
      !course?.id ||
      !canUseCourseContent ||
      !syllabusLessonIds.length
    ) {
      return;
    }

    dispatch(
      hydrateCompletedLessonsFromLearningService({
        courseId: course.id,
        courseLessonIds: syllabusLessonIds,
      }),
    );
  }, [
    canUseCourseContent,
    course?.id,
    dispatch,
    isBackendLessonRoute,
    syllabusLessonIds,
  ]);

  useEffect(() => {
    if (
      !lesson ||
      lesson.type !== "code" ||
      lessonDraft ||
      !lesson.grader?.starterCode
    ) {
      return;
    }

    dispatch(
      saveCodeDraft({
        lessonId: lesson.id,
        code: lesson.grader.starterCode,
      }),
    );
  }, [dispatch, lesson, lessonDraft]);

  function handleChoiceChange(questionId, optionId) {
    if (!lesson || lesson.type !== "quiz") {
      return;
    }

    const question = lesson.questions?.find((item) => item.id === questionId);

    if (!question) {
      return;
    }

    const selectedOptionIds =
      lessonDraft?.answersByQuestionId?.[questionId]?.selectedOptionIds ?? [];
    const isMultiple = question.type === "multiple_choice";

    const nextSelectedOptionIds = isMultiple
      ? selectedOptionIds.includes(optionId)
        ? selectedOptionIds.filter((id) => id !== optionId)
        : [...selectedOptionIds, optionId]
      : [optionId];

    dispatch(
      saveChoiceDraft({
        lessonId: lesson.id,
        questionId,
        selectedOptionIds: nextSelectedOptionIds,
      }),
    );
  }

  function handleTextChange(questionId, answer) {
    if (!lesson || lesson.type !== "quiz") {
      return;
    }

    dispatch(
      saveTextDraft({
        lessonId: lesson.id,
        questionId,
        answer,
      }),
    );
  }

  function handleCodeChange(code) {
    if (!lesson || lesson.type !== "code") {
      return;
    }

    dispatch(
      saveCodeDraft({
        lessonId: lesson.id,
        code,
      }),
    );
  }

  async function handleRunCode() {
    if (!lesson || lesson.type !== "code") {
      return;
    }

    setIsRunning(true);

    try {
      await dispatch(runCodeLesson({ lesson }));
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSubmitLesson() {
    if (!lesson) {
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(
        submitLessonAnswer({
          lesson,
          courseId: course?.id,
          courseLessonIds: syllabusLessonIds,
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function openLessonRoute(targetLesson) {
    if (!course || !targetLesson?.lessonId) {
      return;
    }

    startLessonNavigationTransition(() => {
      navigate(`/courses/${course.id}/lessons/${targetLesson.lessonId}`);
    });
  }

  function handleOpenPreviousLesson() {
    if (previousLesson) {
      openLessonRoute(previousLesson);
    }
  }

  function handleOpenNextLesson() {
    if (nextLesson) {
      openLessonRoute(nextLesson);
    }
  }

  function handlePageRetry() {
    retryBackendPageRequest();
  }

  if (
    isBackendLessonRoute &&
    !pageData &&
    (backendPageStatus === "idle" || backendPageStatus === "loading")
  ) {
    return (
      <div className="lesson-page">
        <section className="lesson-card">
          <p className="lesson-label">Загрузка урока</p>
          <h1 className="lesson-title">Загружаем урок</h1>
          <p className="lesson-text">
            Подготавливаем содержание и задания урока.
          </p>
        </section>
      </div>
    );
  }

  if (isBackendLessonRoute && backendPageStatus === "error" && !pageData) {
    return (
      <div className="lesson-page">
        <section className="lesson-card">
          <p className="lesson-label">Ошибка загрузки</p>
          <h1 className="lesson-title">Не удалось получить урок</h1>
          <p className="lesson-text">
            {backendPageError || "Не удалось получить данные урока."}
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

  if (!pageData || !course || !lesson) {
    return (
      <div className="lesson-page">
        <section className="lesson-card">
          <p className="lesson-label">Ошибка навигации</p>
          <h1 className="lesson-title">Урок не найден</h1>
          <p className="lesson-text">
            Возможно, урок еще не подключен к текущему сценарию.
          </p>
          <Link
            to={`/courses/${courseId}?tab=content`}
            className="course-inline-btn"
          >
            Вернуться к курсу
          </Link>
        </section>
      </div>
    );
  }

  if (!isBackendCourse && course.id !== numericCourseId) {
    return (
      <div className="lesson-page">
        <section className="lesson-card">
          <p className="lesson-label">Ошибка навигации</p>
          <h1 className="lesson-title">Неверный курс</h1>
          <p className="lesson-text">
            Этот урок не относится к выбранному курсу.
          </p>
          <Link
            to={`/courses/${courseId}?tab=content`}
            className="course-inline-btn"
          >
            Вернуться к курсу
          </Link>
        </section>
      </div>
    );
  }

  if (isBackendCourse && !canUseCourseContent) {
    return (
      <div className="lesson-page">
        <section className="lesson-card">
          <p className="lesson-label">Урок недоступен</p>
          <h1 className="lesson-title">Сначала запишитесь на курс</h1>
          <p className="lesson-text">
            Прогресс уроков сохраняется после записи на курс.
          </p>
          <Link
            to={`/courses/${courseId}?tab=content`}
            className="course-inline-btn"
          >
            Вернуться к курсу
          </Link>
        </section>
      </div>
    );
  }

  const isLessonTransitioning =
    isLessonNavigationPending ||
    (isBackendLessonRoute &&
      backendPageStatus === "loading" &&
      backendResolvedLessonId !== lessonId);
  const canRenderAssistantLauncher =
    typeof document !== "undefined" && !assistant.isOpen && lesson;

  return (
    <>
      <div
        className={`lesson-layout ${
          assistant.isOpen ? "lesson-layout-assistant-open" : ""
        }`}
      >
        <CourseOutline
          course={course}
          syllabus={syllabus}
          currentLessonId={lesson.id}
          completedLessonIds={completedSyllabusLessonIds}
          completedLessonsCount={completedLessonsCount}
          courseProgressPercent={courseProgressPercent}
          lessonProgressByLessonId={lessonProgressByLessonId}
          showLessonProgress={canUseCourseContent}
        />

        <div className="lesson-workspace">
          <LessonContentSection
            lesson={lesson}
            contentStatus={contentStatus}
            contentBlocks={contentBlocks}
            contentError={contentError}
            isLessonViewed={isLessonViewed}
            isLessonCompleted={isLessonCompleted}
            lessonDraft={lessonDraft}
            lessonSubmission={lessonSubmission}
            lessonRunResult={lessonRunResult}
            onChoiceChange={handleChoiceChange}
            onTextChange={handleTextChange}
            onCodeChange={handleCodeChange}
            onRunCode={handleRunCode}
            onSubmitLesson={handleSubmitLesson}
            previousLesson={previousLesson}
            nextLesson={nextLesson}
            onOpenPreviousLesson={handleOpenPreviousLesson}
            onOpenNextLesson={handleOpenNextLesson}
            isSubmitting={isSubmitting}
            isRunning={isRunning}
            isTransitioning={isLessonTransitioning}
            showCertificateCallout={certificate.showCertificateCallout}
            isIssuingCertificate={certificate.isIssuingCertificate}
            hasCertificateAlready={certificate.hasCertificateAlready}
            onRequestCertificate={certificate.requestCertificate}
          />
        </div>

        {assistant.isOpen ? (
          <div className="lesson-assistant-rail">
            <AssistantPanel
              title={assistant.title}
              subtitle={assistant.subtitle}
              messages={assistant.messages}
              status={assistant.status}
              error={assistant.error}
              onSubmitMessage={assistant.submitMessage}
              onClose={assistant.close}
            />
          </div>
        ) : null}
      </div>

      {canRenderAssistantLauncher
        ? createPortal(
            <button
              type="button"
              className="assistant-launcher-btn"
              onClick={assistant.open}
              aria-label="Открыть чат с ассистентом"
            >
              <span className="assistant-launcher-icon">AI</span>
              <span className="assistant-launcher-text">
                Спросить ассистента
              </span>
            </button>,
            document.body,
          )
        : null}

      <CertificateDialog
        dialog={certificate.dialog}
        onClose={certificate.closeDialog}
      />
    </>
  );
}

export default LessonPage;
