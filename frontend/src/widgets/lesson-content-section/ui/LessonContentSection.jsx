import { useMemo } from "react";
import { LessonMarkdownPreview } from "../../../entities/lesson";
import LessonAssets from "./LessonAssets";
import LessonCertificateCallout from "./LessonCertificateCallout";
import LessonNavigationFooter from "./LessonNavigationFooter";
import { LessonCaseList, LessonSubmissionResult } from "./LessonResults";

function getLessonTypeLabel(lesson) {
  if (lesson?.type === "code") {
    return "Практический урок";
  }

  if (lesson?.type === "quiz") {
    return `Проверка знаний${lesson.questions?.length ? ` · ${lesson.questions.length} вопросов` : ""}`;
  }

  return "Теоретический урок";
}

function LessonContentSection({
  lesson,
  contentStatus,
  contentBlocks,
  contentError,
  isLessonViewed,
  isLessonCompleted,
  lessonDraft,
  lessonSubmission,
  lessonRunResult,
  onChoiceChange,
  onTextChange,
  onCodeChange,
  onRunCode,
  onSubmitLesson,
  previousLesson,
  nextLesson,
  onOpenPreviousLesson,
  onOpenNextLesson,
  isSubmitting,
  isRunning,
  isTransitioning,
  showCertificateCallout,
  isIssuingCertificate,
  hasCertificateAlready = false,
  onRequestCertificate,
}) {
  const isQuizLesson = lesson?.type === "quiz";
  const isCodeLesson = lesson?.type === "code";
  const isTheoryLesson = lesson?.type === "theory";
  const lessonAssets = useMemo(() => lesson?.assets ?? [], [lesson]);
  const answersByQuestionId = lessonDraft?.answersByQuestionId ?? {};
  const codeValue = lessonDraft?.code ?? "";
  const contentPanelClassName = [
    "lesson-content-panel",
    contentStatus === "loading" ? "loading" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <main className="lesson-content-section">
      <section
        className="lesson-content-card"
        aria-busy={contentStatus === "loading" || isTransitioning}
      >
        <div className="lesson-content-head">
          <p className="lesson-content-module">{lesson.moduleTitle}</p>
          <h1 className="lesson-content-title">{lesson.title}</h1>
          <p className="lesson-content-description">
            {getLessonTypeLabel(lesson)}
          </p>
        </div>

        <section className={contentPanelClassName}>
          <p className="lesson-content-kicker">Содержимое урока</p>

          <h2 className="lesson-content-heading">{lesson.title}</h2>

          {contentStatus === "loading" ? (
            <div className="lesson-content-loading">
              <p className="lesson-content-copy">
                {isTransitioning
                  ? "Переключаем урок и подгружаем материал..."
                  : "Загружаем содержимое урока..."}
              </p>
              <div className="lesson-content-skeleton" aria-hidden="true">
                <span className="lesson-content-skeleton-line wide" />
                <span className="lesson-content-skeleton-line medium" />
                <span className="lesson-content-skeleton-line short" />
              </div>
            </div>
          ) : null}

          {contentStatus === "error" ? (
            <p className="lesson-content-copy">{contentError}</p>
          ) : null}

          {contentStatus === "success" ? (
            <>
              <LessonAssets assets={lessonAssets} />
              <LessonMarkdownPreview blocks={contentBlocks} />
            </>
          ) : null}

          {isTheoryLesson ? (
            <div className="lesson-answer-card">
              <p className="lesson-answer-label">Теоретический урок</p>
              <div className="lesson-submission-result correct">
                <p className="lesson-submission-feedback">
                  Этот урок засчитывается автоматически после открытия.
                </p>
              </div>
            </div>
          ) : null}

          {isQuizLesson ? (
            <div className="lesson-answer-card">
              <p className="lesson-answer-label">Ответьте на вопросы</p>

              <div className="lesson-choice-options">
                {(lesson.questions ?? []).map((question, questionIndex) => {
                  const answerDraft = answersByQuestionId[question.id] ?? null;
                  const selectedOptionIds =
                    answerDraft?.selectedOptionIds ?? [];
                  const textAnswer = answerDraft?.answer ?? "";
                  const isTextQuestion = question.type === "text";
                  const isMultipleChoice =
                    question.type === "multiple_choice";

                  return (
                    <div
                      key={question.id}
                      className="lesson-content-panel question"
                    >
                      <p className="lesson-content-kicker">
                        Вопрос {questionIndex + 1}
                      </p>
                      <h3 className="lesson-content-heading">{question.text}</h3>

                      {isTextQuestion ? (
                        <textarea
                          className="lesson-text-answer"
                          value={textAnswer}
                          onChange={(event) =>
                            onTextChange(question.id, event.target.value)
                          }
                          placeholder="Напишите ответ"
                        />
                      ) : (
                        <div className="lesson-choice-options">
                          {(question.options ?? []).map((option) => (
                            <label
                              key={option.id}
                              className="lesson-choice-option"
                            >
                              <input
                                type={isMultipleChoice ? "checkbox" : "radio"}
                                name={`lesson-${lesson.id}-question-${question.id}`}
                                checked={selectedOptionIds.includes(option.id)}
                                onChange={() =>
                                  onChoiceChange(question.id, option.id)
                                }
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="course-primary-btn"
                onClick={onSubmitLesson}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Проверяем..." : "Проверить ответы"}
              </button>

              <LessonSubmissionResult submission={lessonSubmission} />
            </div>
          ) : null}

          {isCodeLesson ? (
            <div className="lesson-answer-card">
              <div className="lesson-code-head">
                <p className="lesson-answer-label">Редактор кода</p>
                <span className="lesson-code-language">
                  {lesson?.grader?.language ?? "code"}
                </span>
              </div>

              <textarea
                className="lesson-code-editor"
                value={codeValue}
                onChange={(event) => onCodeChange(event.target.value)}
                spellCheck={false}
              />

              <div className="lesson-code-actions">
                <button
                  type="button"
                  className="course-inline-btn"
                  onClick={onRunCode}
                  disabled={isRunning}
                >
                  {isRunning ? "Запускаем..." : "Запустить код"}
                </button>

                <button
                  type="button"
                  className="course-primary-btn"
                  onClick={onSubmitLesson}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Проверяем..." : "Отправить решение"}
                </button>
              </div>

              {lessonRunResult ? (
                <div
                  className={`lesson-run-result ${
                    lessonRunResult.status === "success" ? "success" : "failed"
                  }`}
                >
                  <p className="lesson-run-result-title">
                    Результат запуска: {lessonRunResult.feedback}
                  </p>
                  <p className="lesson-run-result-meta">
                    Видимые тесты: {lessonRunResult.passedCases}/
                    {lessonRunResult.totalCases}
                  </p>
                </div>
              ) : null}

              <LessonCaseList cases={lessonRunResult?.cases} title="Результаты запуска" />
              <LessonSubmissionResult submission={lessonSubmission} />
              <LessonCaseList
                cases={lessonSubmission?.cases}
                title="Результаты проверки решения"
              />
            </div>
          ) : null}

          {showCertificateCallout ? (
            <LessonCertificateCallout
              hasCertificateAlready={hasCertificateAlready}
              isIssuingCertificate={isIssuingCertificate}
              onRequestCertificate={onRequestCertificate}
            />
          ) : null}

          <LessonNavigationFooter
            isLessonViewed={isLessonViewed}
            isLessonCompleted={isLessonCompleted}
            previousLesson={previousLesson}
            nextLesson={nextLesson}
            onOpenPreviousLesson={onOpenPreviousLesson}
            onOpenNextLesson={onOpenNextLesson}
            isTransitioning={isTransitioning}
          />
        </section>
      </section>
    </main>
  );
}

export default LessonContentSection;
