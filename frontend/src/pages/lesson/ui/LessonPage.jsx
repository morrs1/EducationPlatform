import { useEffect, useMemo, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router";
import { createPortal } from "react-dom";

import { getLessonPageData } from "../lib/getLessonPageData";
import {
  getCachedLessonContentMarkdown,
  getLessonContentMarkdown,
} from "../lib/getLessonContentMarkdown";
import {
  getLessonProgressMap,
  parseLessonMarkdown,
} from "../../../entities/lesson";
import { getCourseSyllabus } from "../../../entities/course";
import {
  isUuid,
  mapReadLessonByIdResponseToLessonPageData,
  requestCourseById,
  requestLessonById,
} from "../../../entities/course";
import { CourseOutline } from "../../../widgets/course-outline";
import { LessonContentSection } from "../../../widgets/lesson-content-section";
import { AssistantPanel } from "../../../widgets/assistant-panel";
import {
  closeAssistant,
  openAssistant,
  selectAssistantIsOpen,
  selectAssistantThreadByContextKey,
  setActiveAssistantContext,
  submitAssistantMessage,
} from "../../../features/assistant";

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
import {
  completeViewerCourseWithLearningService,
  selectCanViewCourseContent,
  selectIsCompletedCourse,
  selectIsEnrolledInCourse,
} from "../../../features/viewer";

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
  const [backendPageStatus, setBackendPageStatus] = useState(() =>
    isBackendLessonRoute ? "loading" : "idle",
  );
  const [backendPageData, setBackendPageData] = useState(null);
  const [backendResolvedLessonId, setBackendResolvedLessonId] = useState(null);
  const [backendPageError, setBackendPageError] = useState("");
  const [backendRequestSeed, setBackendRequestSeed] = useState(0);

  useEffect(() => {
    if (!isBackendLessonRoute || !courseId || !lessonId) {
      return;
    }

    let isCancelled = false;

    async function loadBackendLesson() {
      setBackendPageStatus("loading");
      setBackendPageError("");

      try {
        const [courseResponse, lessonResponse] = await Promise.all([
          requestCourseById(courseId),
          requestLessonById(lessonId),
        ]);
        const nextPageData = mapReadLessonByIdResponseToLessonPageData({
          courseId,
          lessonId,
          courseResponse,
          lessonResponse,
        });

        if (!isCancelled) {
          setBackendPageData(nextPageData);
          setBackendResolvedLessonId(lessonId);
          setBackendPageStatus("success");
        }
      } catch (error) {
        if (!isCancelled) {
          setBackendResolvedLessonId(null);
          setBackendPageStatus("error");
          setBackendPageError(
            error?.message ?? "Не удалось загрузить урок.",
          );
        }
      }
    }

    loadBackendLesson();

    return () => {
      isCancelled = true;
    };
  }, [courseId, lessonId, isBackendLessonRoute, backendRequestSeed]);

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

  const [contentStatus, setContentStatus] = useState("idle");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [contentError, setContentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const isLessonViewed = lesson ? viewedLessonIds.includes(lesson.id) : false;
  const isLessonCompleted = lesson
    ? completedLessonIds.includes(lesson.id)
    : false;
  const isBackendCourse = Boolean(course?.isBackendCourse);
  const canUseCourseContent = isBackendCourse ? true : canViewContent;

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
  const contentBlocks = useMemo(
    () => parseLessonMarkdown(contentMarkdown),
    [contentMarkdown],
  );
  const assistantContextKey = lesson ? lesson.id : null;
  const isAssistantOpen = useSelector(selectAssistantIsOpen);
  const assistantThread = useSelector((state) =>
    assistantContextKey
      ? selectAssistantThreadByContextKey(state, assistantContextKey)
      : {
          messages: [],
          status: "idle",
          error: null,
          threadId: null,
        },
  );
  const assistantMessages = assistantThread.messages;
  const assistantStatus = assistantThread.status;
  const assistantError = assistantThread.error;
  const assistantThreadId = assistantThread.threadId;
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
  const assistantTitle = "Ассистент";
  const assistantSubtitle = lesson?.title ?? "";

  useEffect(() => {
    if (!lesson) {
      return;
    }

    dispatch(openLesson({ lesson, courseId: course?.id ?? null }));
  }, [course?.id, dispatch, lesson]);

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
      !isBackendLessonRoute ||
      !isEnrolled ||
      isCompletedCourse ||
      !course ||
      !syllabusLessonIds.length ||
      completedSyllabusLessonIds.length < syllabusLessonIds.length
    ) {
      return;
    }

    dispatch(
      completeViewerCourseWithLearningService({
        courseId: course.id,
        courseSnapshot: course,
      }),
    );
  }, [
    completedSyllabusLessonIds.length,
    course,
    dispatch,
    isBackendLessonRoute,
    isCompletedCourse,
    isEnrolled,
    syllabusLessonIds.length,
  ]);

  useEffect(() => {
    if (!assistantContextKey) {
      return;
    }

    dispatch(setActiveAssistantContext(assistantContextKey));
  }, [dispatch, assistantContextKey, lesson]);

  useEffect(() => {
    if (!lesson) {
      setContentStatus("idle");
      setContentMarkdown("");
      setContentError("");
      return;
    }

    const cachedMarkdown = getCachedLessonContentMarkdown(lesson);

    if (cachedMarkdown) {
      setContentMarkdown(cachedMarkdown);
      setContentStatus("success");
      setContentError("");
      return;
    }

    let isCancelled = false;

    async function loadLessonContent() {
      setContentStatus("loading");
      setContentMarkdown("");
      setContentError("");

      try {
        const markdown = await getLessonContentMarkdown(lesson);

        if (!isCancelled) {
          setContentMarkdown(markdown);
          setContentStatus("success");
        }
      } catch (error) {
        if (!isCancelled) {
          setContentMarkdown("");
          setContentStatus("error");
          setContentError(
            error?.message ?? "Не удалось загрузить содержимое урока.",
          );
        }
      }
    }

    loadLessonContent();

    return () => {
      isCancelled = true;
    };
  }, [backendPageError, backendPageStatus, lesson]);

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

  function handleOpenAssistant() {
    if (!assistantContextKey) {
      return;
    }

    dispatch(setActiveAssistantContext(assistantContextKey));
    dispatch(openAssistant());
  }

  function handleCloseAssistant() {
    dispatch(closeAssistant());
  }

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
      await dispatch(submitLessonAnswer({ lesson, courseId: course?.id }));
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

  async function handleSubmitAssistantMessage(messageText) {
    if (!course || !lesson || !assistantContextKey) {
      return;
    }

    await dispatch(
      submitAssistantMessage({
        contextKey: assistantContextKey,
        threadId: assistantThreadId,
        courseId: course.id,
        lessonId: lesson.id,
        stepId: lesson.id,
        userMessage: messageText,
        lessonTitle: course.title,
        stepTitle: lesson.title,
        stepType: lesson.type,
        stepMarkdown: contentMarkdown,
      }),
    );
  }

  function handlePageRetry() {
    setBackendRequestSeed((value) => value + 1);
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

  const isLessonTransitioning =
    isLessonNavigationPending ||
    (isBackendLessonRoute &&
      backendPageStatus === "loading" &&
      backendResolvedLessonId !== lessonId);
  const canRenderAssistantLauncher =
    typeof document !== "undefined" && !isAssistantOpen && lesson;

  return (
    <>
      <div
        className={`lesson-layout ${
          isAssistantOpen ? "lesson-layout-assistant-open" : ""
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
          />
        </div>

        {isAssistantOpen ? (
          <div className="lesson-assistant-rail">
            <AssistantPanel
              title={assistantTitle}
              subtitle={assistantSubtitle}
              messages={assistantMessages}
              status={assistantStatus}
              error={assistantError}
              onSubmitMessage={handleSubmitAssistantMessage}
              onClose={handleCloseAssistant}
            />
          </div>
        ) : null}
      </div>

      {canRenderAssistantLauncher
        ? createPortal(
            <button
              type="button"
              className="assistant-launcher-btn"
              onClick={handleOpenAssistant}
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
    </>
  );
}

export default LessonPage;
