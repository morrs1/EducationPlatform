import { useEffect, useLayoutEffect, useRef } from "react";

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

function renderSubmissionResult(stepSubmission) {
  if (!stepSubmission) {
    return null;
  }

  return (
    <div
      className={`lesson-submission-result ${
        stepSubmission.status === "correct" ? "correct" : "incorrect"
      }`}
    >
      <p className="lesson-submission-feedback">{stepSubmission.feedback}</p>
      <div className="lesson-submission-meta-list">
        <p className="lesson-submission-meta">
          Баллы: {stepSubmission.score}/{stepSubmission.maxScore}
        </p>
        <p className="lesson-submission-meta">
          Попытка: {stepSubmission.attemptCount}
        </p>
        {typeof stepSubmission.passedCases === "number" &&
        typeof stepSubmission.totalCases === "number" ? (
          <p className="lesson-submission-meta">
            Тесты: {stepSubmission.passedCases}/{stepSubmission.totalCases}
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

function LessonStepSection({
  lesson,
  steps,
  currentStep,
  onOpenStep,
  onOpenPreviousStep,
  onOpenNextStep,
  previousStep,
  nextStep,
  contentStatus,
  contentBlocks,
  contentError,
  viewedStepIds,
  completedStepIds,
  completedStepsCount,
  isCurrentStepCompleted,
  stepDraft,
  stepSubmission,
  stepRunResult,
  onChoiceChange,
  onTextChange,
  onCodeChange,
  onRunCode,
  onSubmitStep,
  isSubmitting,
  isRunning,
}) {
  const tabsRef = useRef(null);
  const sectionCardRef = useRef(null);

  function handleTabsWheel(event) {
    if (!tabsRef.current) {
      return;
    }

    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.preventDefault();
    tabsRef.current.scrollLeft += event.deltaY;
  }

  useEffect(() => {
    const activeStepButton = tabsRef.current?.querySelector(
      "[data-active-step='true']",
    );

    activeStepButton?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentStep?.id]);

  useLayoutEffect(() => {
    sectionCardRef.current?.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [currentStep?.id]);

  const isChoiceStep = currentStep?.type === "quiz_choice";
  const isTextStep = currentStep?.type === "quiz_text";
  const isCodeStep = currentStep?.type === "code";
  const isTheoryStep = currentStep?.type === "theory";
  const selectedOptionIds = stepDraft?.selectedOptionIds ?? [];
  const choiceOptions = currentStep?.grader?.options ?? [];
  const choiceInputType = currentStep?.grader?.multiple ? "checkbox" : "radio";
  const textAnswer = stepDraft?.answer ?? "";
  const codeValue = stepDraft?.code ?? "";

  return (
    <main className="lesson-step-section">
      <section ref={sectionCardRef} className="lesson-step-section-card">
        <div
          ref={tabsRef}
          className="lesson-step-tabs"
          onWheel={handleTabsWheel}
        >
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => onOpenStep(step)}
              className={`lesson-step-tab ${
                currentStep?.id === step.id ? "active" : ""
              } ${
                completedStepIds.includes(step.id)
                  ? "completed"
                  : viewedStepIds.includes(step.id)
                    ? "viewed"
                    : ""
              }`}
              data-active-step={
                currentStep?.id === step.id ? "true" : undefined
              }
            >
              Шаг {step.position}
            </button>
          ))}
        </div>

        <div className="lesson-step-section-head">
          <p className="lesson-step-section-module">{lesson.moduleTitle}</p>
          <h1 className="lesson-step-section-title">{lesson.title}</h1>
          <p className="lesson-step-section-description">
            Пройдено шагов: {completedStepsCount}/{steps.length}
          </p>
        </div>

        <section className="lesson-step-content-placeholder">
          <p className="lesson-step-content-label">
            {currentStep ? `Шаг ${currentStep.position}` : "Содержимое шага"}
          </p>

          <h2 className="lesson-step-content-title">
            {currentStep ? currentStep.title : "Шаг не выбран"}
          </h2>

          {contentStatus === "loading" ? (
            <p className="lesson-step-content-text">
              Загружаем содержимое шага...
            </p>
          ) : null}

          {contentStatus === "error" ? (
            <p className="lesson-step-content-text">{contentError}</p>
          ) : null}

          {contentStatus === "success" ? (
            <div className="lesson-markdown">
              {contentBlocks.map((block, index) =>
                renderMarkdownBlock(block, index),
              )}
            </div>
          ) : null}

          {isTheoryStep ? (
            <div className="lesson-answer-card">
              <p className="lesson-answer-label">Теоретический шаг</p>
              <div className="lesson-submission-result correct">
                <p className="lesson-submission-feedback">
                  Этот шаг засчитывается автоматически после открытия.
                </p>
              </div>
            </div>
          ) : null}

          {isChoiceStep ? (
            <div className="lesson-answer-card">
              <p className="lesson-answer-label">Выберите ответ</p>

              <div className="lesson-choice-options">
                {choiceOptions.map((option) => {
                  const isSelected = selectedOptionIds.includes(option.id);

                  return (
                    <label key={option.id} className="lesson-choice-option">
                      <input
                        type={choiceInputType}
                        name={`step-${currentStep.id}`}
                        checked={isSelected}
                        onChange={() => onChoiceChange(option.id)}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                className="course-primary-btn"
                onClick={onSubmitStep}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Проверяем..." : "Проверить"}
              </button>

              {renderSubmissionResult(stepSubmission)}
            </div>
          ) : null}

          {isTextStep ? (
            <div className="lesson-answer-card">
              <p className="lesson-answer-label">Введите ответ</p>

              <textarea
                className="lesson-text-answer"
                value={textAnswer}
                onChange={(event) => onTextChange(event.target.value)}
                placeholder="Напишите короткий ответ"
              />

              <button
                type="button"
                className="course-primary-btn"
                onClick={onSubmitStep}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Проверяем..." : "Проверить"}
              </button>

              {renderSubmissionResult(stepSubmission)}
            </div>
          ) : null}

          {isCodeStep ? (
            <div className="lesson-answer-card">
              <div className="lesson-code-head">
                <p className="lesson-answer-label">Редактор кода</p>
                <span className="lesson-code-language">
                  {currentStep?.grader?.language ?? "code"}
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
                  onClick={onSubmitStep}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Проверяем..." : "Отправить решение"}
                </button>
              </div>

              {stepRunResult ? (
                <div
                  className={`lesson-run-result ${
                    stepRunResult.status === "success" ? "success" : "failed"
                  }`}
                >
                  <p className="lesson-run-result-title">
                    Результат запуска: {stepRunResult.feedback}
                  </p>
                  <p className="lesson-run-result-meta">
                    Видимые тесты: {stepRunResult.passedCases}/
                    {stepRunResult.totalCases}
                  </p>
                </div>
              ) : null}

              {renderCaseList(stepRunResult?.cases, "Результаты запуска")}
              {renderSubmissionResult(stepSubmission)}
              {renderCaseList(
                stepSubmission?.cases,
                "Результаты проверки решения",
              )}
            </div>
          ) : null}

          {!currentStep ? (
            <p className="lesson-step-content-text">
              На следующем этапе здесь появится markdown текущего шага и
              элементы взаимодействия.
            </p>
          ) : null}

          {currentStep ? (
            <div className="lesson-step-footer">
              <div
                className={`lesson-step-status ${
                  isCurrentStepCompleted ? "completed" : "in-progress"
                }`}
              >
                {isCurrentStepCompleted ? "Шаг пройден" : "Шаг в процессе"}
              </div>

              <div className="lesson-step-actions">
                <button
                  type="button"
                  className="course-inline-btn"
                  onClick={onOpenPreviousStep}
                  disabled={!previousStep}
                >
                  Предыдущий шаг
                </button>

                <button
                  type="button"
                  className="course-primary-btn"
                  onClick={onOpenNextStep}
                  disabled={!nextStep}
                >
                  Следующий шаг
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

export default LessonStepSection;
