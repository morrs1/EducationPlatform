import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router";

import { getLessonPageData } from "../lib/getLessonPageData";
import { getStepContentMarkdown } from "../lib/getStepContentMarkdown";
import { parseLessonMarkdown } from "../lib/parseLessonMarkdown";
import { getCourseSyllabus } from "../../../entities/course/model/mockCourseSyllabus";
import { getLessonProgressMap } from "../../../entities/lesson/model/progress";
import CourseOutline from "../../../widgets/course-outline/ui/CourseOutline";
import LessonStepSection from "../../../widgets/lesson-step-section/ui/LessonStepSection";

import {
  openLessonStep,
  runCodeStep,
  saveCodeDraft,
  selectCompletedStepIds,
  selectCurrentStepId,
  selectStepRunResult,
  saveChoiceDraft,
  saveTextDraft,
  selectStepDraft,
  selectViewedStepIds,
  selectLessonCompletedStepsCount,
  selectStepSubmission,
  submitStepAnswer,
} from "../../../features/lesson-session";
import { selectCanViewCourseContent } from "../../../features/viewer";

function LessonPage() {
  const { courseId, lessonId } = useParams();
  const numericCourseId = Number(courseId);
  const pageData = useMemo(() => getLessonPageData(lessonId), [lessonId]);
  const dispatch = useDispatch();

  const course = pageData?.course ?? null;
  const lesson = pageData?.lesson ?? null;
  const steps = pageData?.steps ?? [];

  const currentStepId = useSelector((state) =>
    lesson ? selectCurrentStepId(state, lesson.id) : null,
  );
  const viewedStepIds = useSelector(selectViewedStepIds);
  const completedStepIds = useSelector(selectCompletedStepIds);
  const canViewContent = useSelector((state) =>
    course ? selectCanViewCourseContent(state, course.id) : false,
  );

  const currentStep = useMemo(
    () => steps.find((step) => step.id === currentStepId) ?? steps[0] ?? null,
    [steps, currentStepId],
  );
  const currentStepIndex = useMemo(
    () => (currentStep ? steps.findIndex((step) => step.id === currentStep.id) : -1),
    [steps, currentStep],
  );
  const previousStep =
    currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
  const nextStep =
    currentStepIndex >= 0 && currentStepIndex < steps.length - 1
      ? steps[currentStepIndex + 1]
      : null;

  const stepDraft = useSelector((state) =>
    currentStep ? selectStepDraft(state, currentStep.id) : null,
  );

  const stepSubmission = useSelector((state) =>
    currentStep ? selectStepSubmission(state, currentStep.id) : null,
  );
  const stepRunResult = useSelector((state) =>
    currentStep ? selectStepRunResult(state, currentStep.id) : null,
  );

  const [contentStatus, setContentStatus] = useState("idle");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [contentError, setContentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const completedStepsCount = useSelector((state) =>
    lesson ? selectLessonCompletedStepsCount(state, lesson) : 0,
  );
  const isCurrentStepCompleted = currentStep
    ? completedStepIds.includes(currentStep.id)
    : false;

  const syllabus = useMemo(
    () => (course ? getCourseSyllabus(course.id) : null),
    [course],
  );
  const lessonProgressByLessonId = useMemo(
    () => getLessonProgressMap(completedStepIds),
    [completedStepIds],
  );
  const syllabusLessonIds = useMemo(
    () =>
      (syllabus?.modules ?? [])
        .flatMap((module) => module.lessons.map((item) => item.lessonId))
        .filter(Boolean),
    [syllabus],
  );
  const completedLessonIds = useMemo(
    () =>
      syllabusLessonIds.filter((id) => {
        const progress = lessonProgressByLessonId[id];

        return progress?.isCompleted;
      }),
    [lessonProgressByLessonId, syllabusLessonIds],
  );
  const completedLessonsCount = completedLessonIds.length;
  const courseProgressPercent = course?.lessonsCount
    ? (completedLessonsCount / course.lessonsCount) * 100
    : 0;
  const contentBlocks = useMemo(
    () => parseLessonMarkdown(contentMarkdown),
    [contentMarkdown],
  );

  useEffect(() => {
    if (!lesson || !steps.length || currentStepId) {
      return;
    }

    const firstStep = steps[0];

    dispatch(
      openLessonStep({
        lessonId: lesson.id,
        stepId: firstStep.id,
        stepType: firstStep.type,
      }),
    );
  }, [dispatch, lesson, steps, currentStepId]);

  useEffect(() => {
    if (!currentStep) {
      setContentStatus("idle");
      setContentMarkdown("");
      setContentError("");
      return;
    }

    let isCancelled = false;

    async function loadStepContent() {
      setContentStatus("loading");
      setContentMarkdown("");
      setContentError("");

      try {
        const markdown = await getStepContentMarkdown(currentStep.id);

        if (!isCancelled) {
          setContentMarkdown(markdown);
          setContentStatus("success");
        }
      } catch (error) {
        if (!isCancelled) {
          setContentMarkdown("");
          setContentStatus("error");
          setContentError(
            error?.message ?? "Не удалось загрузить содержимое шага.",
          );
        }
      }
    }

    loadStepContent();

    return () => {
      isCancelled = true;
    };
  }, [currentStep?.id]);

  useEffect(() => {
    if (
      !currentStep ||
      currentStep.type !== "code" ||
      stepDraft ||
      !currentStep.grader?.starterCode
    ) {
      return;
    }

    dispatch(
      saveCodeDraft({
        stepId: currentStep.id,
        code: currentStep.grader.starterCode,
      }),
    );
  }, [dispatch, currentStep, stepDraft]);

  function handleOpenStep(step) {
    if (!lesson || !step) {
      return;
    }

    dispatch(
      openLessonStep({
        lessonId: lesson.id,
        stepId: step.id,
        stepType: step.type,
      }),
    );
  }

  function handleOpenPreviousStep() {
    if (previousStep) {
      handleOpenStep(previousStep);
    }
  }

  function handleOpenNextStep() {
    if (nextStep) {
      handleOpenStep(nextStep);
    }
  }

  function handleChoiceChange(optionId) {
    if (!currentStep || currentStep.type !== "quiz_choice") {
      return;
    }

    const selectedOptionIds = stepDraft?.selectedOptionIds ?? [];
    const isMultiple = currentStep.grader?.multiple ?? false;

    const nextSelectedOptionIds = isMultiple
      ? selectedOptionIds.includes(optionId)
        ? selectedOptionIds.filter((id) => id !== optionId)
        : [...selectedOptionIds, optionId]
      : [optionId];

    dispatch(
      saveChoiceDraft({
        stepId: currentStep.id,
        selectedOptionIds: nextSelectedOptionIds,
      }),
    );
  }

  function handleTextChange(answer) {
    if (!currentStep || currentStep.type !== "quiz_text") {
      return;
    }

    dispatch(
      saveTextDraft({
        stepId: currentStep.id,
        answer,
      }),
    );
  }

  function handleCodeChange(code) {
    if (!currentStep || currentStep.type !== "code") {
      return;
    }

    dispatch(
      saveCodeDraft({
        stepId: currentStep.id,
        code,
      }),
    );
  }

  async function handleRunCode() {
    if (!currentStep || currentStep.type !== "code") {
      return;
    }

    setIsRunning(true);

    try {
      await dispatch(runCodeStep({ step: currentStep }));
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSubmitStep() {
    if (!currentStep) {
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(submitStepAnswer({ step: currentStep }));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!pageData || !course || !lesson) {
    return (
      <div className="lesson-page">
        <section className="lesson-card">
          <p className="lesson-label">Ошибка навигации</p>
          <h1 className="lesson-title">Урок не найден</h1>
          <p className="lesson-text">
            Возможно, урок еще не подключен к демо-сценарию.
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

  if (course.id !== numericCourseId) {
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

  return (
    <div className="lesson-layout">
      <CourseOutline
        course={course}
        syllabus={syllabus}
        currentLessonId={lesson.id}
        completedLessonIds={completedLessonIds}
        completedLessonsCount={completedLessonsCount}
        courseProgressPercent={courseProgressPercent}
        lessonProgressByLessonId={lessonProgressByLessonId}
        showLessonProgress={canViewContent}
      />

      <LessonStepSection
        lesson={lesson}
        steps={steps}
        currentStep={currentStep}
        onOpenStep={handleOpenStep}
        onOpenPreviousStep={handleOpenPreviousStep}
        onOpenNextStep={handleOpenNextStep}
        previousStep={previousStep}
        nextStep={nextStep}
        contentStatus={contentStatus}
        contentBlocks={contentBlocks}
        contentError={contentError}
        viewedStepIds={viewedStepIds}
        completedStepIds={completedStepIds}
        completedStepsCount={completedStepsCount}
        isCurrentStepCompleted={isCurrentStepCompleted}
        stepDraft={stepDraft}
        stepSubmission={stepSubmission}
        stepRunResult={stepRunResult}
        onChoiceChange={handleChoiceChange}
        onTextChange={handleTextChange}
        onCodeChange={handleCodeChange}
        onRunCode={handleRunCode}
        onSubmitStep={handleSubmitStep}
        isSubmitting={isSubmitting}
        isRunning={isRunning}
      />
    </div>
  );
}

export default LessonPage;
