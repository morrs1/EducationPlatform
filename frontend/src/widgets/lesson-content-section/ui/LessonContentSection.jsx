import { useLayoutEffect, useRef } from "react";

function renderInlineText(text) {
  return text
    .split(/(`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) =>
      part.startsWith("`") && part.endsWith("`") ? (
        <code key={`${part}-${index}`} className="lesson-markdown-inline-code">
          {part.slice(1, -1)}
        </code>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      ),
    );
}

function renderMarkdownBlock(block, index) {
  if (block.type === "heading-1") {
    return (
      <h2 key={`heading-1-${index}`} className="lesson-markdown-h1">
        {renderInlineText(block.content)}
      </h2>
    );
  }

  if (block.type === "heading-2") {
    return (
      <h3 key={`heading-2-${index}`} className="lesson-markdown-h2">
        {renderInlineText(block.content)}
      </h3>
    );
  }

  if (block.type === "unordered-list") {
    return (
      <ul key={`unordered-list-${index}`} className="lesson-markdown-list">
        {block.items.map((item, itemIndex) => (
          <li key={`${item}-${itemIndex}`}>{renderInlineText(item)}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "ordered-list") {
    return (
      <ol
        key={`ordered-list-${index}`}
        className="lesson-markdown-list-decimal"
      >
        {block.items.map((item, itemIndex) => (
          <li key={`${item}-${itemIndex}`}>{renderInlineText(item)}</li>
        ))}
      </ol>
    );
  }

  if (block.type === "code-block") {
    return (
      <div key={`code-block-${index}`} className="lesson-markdown-code-wrap">
        {block.language ? (
          <div className="lesson-markdown-code-label">{block.language}</div>
        ) : null}

        <pre className="lesson-markdown-code">
          <code>{block.content}</code>
        </pre>
      </div>
    );
  }

  return (
    <p key={`paragraph-${index}`} className="lesson-markdown-paragraph">
      {renderInlineText(block.content)}
    </p>
  );
}

function renderSubmissionResult(lessonSubmission) {
  if (!lessonSubmission) {
    return null;
  }

  return (
    <div
      className={`lesson-submission-result ${
        lessonSubmission.status === "correct" ? "correct" : "incorrect"
      }`}
    >
      <p className="lesson-submission-feedback">{lessonSubmission.feedback}</p>
      <div className="lesson-submission-meta-list">
        <p className="lesson-submission-meta">
          Баллы: {lessonSubmission.score}/{lessonSubmission.maxScore}
        </p>
        <p className="lesson-submission-meta">
          Попытка: {lessonSubmission.attemptCount}
        </p>
        {typeof lessonSubmission.passedCases === "number" &&
        typeof lessonSubmission.totalCases === "number" ? (
          <p className="lesson-submission-meta">
            Ответы: {lessonSubmission.passedCases}/{lessonSubmission.totalCases}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function renderCaseList(cases, title) {
  if (!cases?.length) {
    return null;
  }

  return (
    <div className="lesson-result-cases-wrap">
      <p className="lesson-result-cases-title">{title}</p>
      <div className="lesson-result-cases">
        {cases.map((testCase) => (
          <div
            key={`${title}-${testCase.index}`}
            className={`lesson-result-case ${testCase.status}`}
          >
            <div className="lesson-result-case-head">
              <span className="lesson-result-case-index">
                Тест {testCase.index}
              </span>
              <span className="lesson-result-case-status">
                {testCase.status === "passed"
                  ? "Пройден"
                  : testCase.status === "failed"
                    ? "Ошибка"
                    : "Не запущен"}
              </span>
            </div>

            <p className="lesson-result-case-message">{testCase.message}</p>

            <div className="lesson-result-case-grid">
              <div className="lesson-result-case-block">
                <span className="lesson-result-case-label">Ввод</span>
                <pre>{testCase.input || "—"}</pre>
              </div>

              <div className="lesson-result-case-block">
                <span className="lesson-result-case-label">Ожидаемый вывод</span>
                <pre>{testCase.expectedOutput || "—"}</pre>
              </div>

              <div className="lesson-result-case-block">
                <span className="lesson-result-case-label">Фактический вывод</span>
                <pre>{testCase.actualOutput || "—"}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
}) {
  const sectionCardRef = useRef(null);

  useLayoutEffect(() => {
    sectionCardRef.current?.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [lesson?.id]);

  const isQuizLesson = lesson?.type === "quiz";
  const isCodeLesson = lesson?.type === "code";
  const isTheoryLesson = lesson?.type === "theory";
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
        ref={sectionCardRef}
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
            <div className="lesson-markdown">
              {contentBlocks.map((block, index) =>
                renderMarkdownBlock(block, index),
              )}
            </div>
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

              {renderSubmissionResult(lessonSubmission)}
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

              {renderCaseList(lessonRunResult?.cases, "Результаты запуска")}
              {renderSubmissionResult(lessonSubmission)}
              {renderCaseList(
                lessonSubmission?.cases,
                "Результаты проверки решения",
              )}
            </div>
          ) : null}

          <div className="lesson-navigation-footer">
            <div
              className={`lesson-progress-status ${
                isLessonCompleted
                  ? "completed"
                  : isLessonViewed
                    ? "in-progress"
                    : ""
              }`}
            >
              {isLessonCompleted
                ? "Урок пройден"
                : isLessonViewed
                  ? "Урок начат"
                  : "Урок не начат"}
            </div>

            <div className="lesson-navigation-actions">
              <button
                type="button"
                className="course-inline-btn"
                onClick={onOpenPreviousLesson}
                disabled={!previousLesson || isTransitioning}
              >
                Предыдущий урок
              </button>

              <button
                type="button"
                className="course-primary-btn"
                onClick={onOpenNextLesson}
                disabled={!nextLesson || isTransitioning}
              >
                Следующий урок
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default LessonContentSection;
