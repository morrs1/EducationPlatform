import { memo, useEffect, useMemo, useRef, useState } from "react";
import { LessonMarkdownPreview } from "../../../entities/lesson";

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

const LessonAssetVideo = memo(function LessonAssetVideo({ asset }) {
  const assetKey =
    asset?.isResolved && asset?.url
      ? `${asset.id ?? "lesson-asset"}:${asset.url}`
      : "";
  const [posterState, setPosterState] = useState({
    key: "",
    url: "",
  });
  const previewVideoRef = useRef(null);
  const captureTimeoutRef = useRef(0);
  const frameRequestIdRef = useRef(null);
  const hasCapturedPosterRef = useRef(false);

  useEffect(() => {
    hasCapturedPosterRef.current = false;
    const previewVideo = previewVideoRef.current;

    return () => {
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
        captureTimeoutRef.current = 0;
      }

      if (
        previewVideo &&
        frameRequestIdRef.current !== null &&
        typeof previewVideo.cancelVideoFrameCallback === "function"
      ) {
        previewVideo.cancelVideoFrameCallback(frameRequestIdRef.current);
      }

      frameRequestIdRef.current = null;
    };
  }, [assetKey]);

  const getPreviewTimestamp = (duration) => {
    const normalizedDuration = Number.isFinite(duration) ? duration : 0;

    if (normalizedDuration <= 0) {
      return 0;
    }

    const midpoint = normalizedDuration * 0.5;
    const lowerBound = normalizedDuration >= 2 ? 1 : normalizedDuration * 0.25;
    const upperBound = Math.max(normalizedDuration - 0.35, 0);

    return Math.min(Math.max(midpoint, lowerBound), upperBound);
  };

  const capturePoster = () => {
    const previewVideo = previewVideoRef.current;

    if (
      !assetKey ||
      !previewVideo ||
      hasCapturedPosterRef.current ||
      !previewVideo.videoWidth ||
      !previewVideo.videoHeight
    ) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = previewVideo.videoWidth;
    canvas.height = previewVideo.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    try {
      context.drawImage(
        previewVideo,
        0,
        0,
        previewVideo.videoWidth,
        previewVideo.videoHeight,
      );

      hasCapturedPosterRef.current = true;
      setPosterState({
        key: assetKey,
        url: canvas.toDataURL("image/jpeg", 0.82),
      });
    } catch {
      setPosterState((previousState) =>
        previousState.key === assetKey
          ? {
              key: assetKey,
              url: "",
            }
          : previousState,
      );
    }
  };

  const schedulePosterCapture = () => {
    const previewVideo = previewVideoRef.current;

    if (!previewVideo || hasCapturedPosterRef.current) {
      return;
    }

    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = 0;
    }

    if (typeof previewVideo.requestVideoFrameCallback === "function") {
      if (frameRequestIdRef.current !== null) {
        previewVideo.cancelVideoFrameCallback?.(frameRequestIdRef.current);
      }

      frameRequestIdRef.current = previewVideo.requestVideoFrameCallback(() => {
        frameRequestIdRef.current = null;
        previewVideo.pause();
        capturePoster();
      });
      return;
    }

    captureTimeoutRef.current = window.setTimeout(() => {
      captureTimeoutRef.current = 0;
      previewVideo.pause();
      capturePoster();
    }, 180);
  };

  const handleLoadedMetadata = () => {
    const previewVideo = previewVideoRef.current;

    if (!previewVideo || !asset?.isResolved || !asset.url) {
      return;
    }

    const previewTimestamp = getPreviewTimestamp(previewVideo.duration);

    if (previewTimestamp <= 0) {
      schedulePosterCapture();
      return;
    }

    try {
      previewVideo.currentTime = previewTimestamp;
    } catch {
      schedulePosterCapture();
    }
  };

  const handleSeeked = () => {
    const previewVideo = previewVideoRef.current;

    if (!previewVideo || hasCapturedPosterRef.current) {
      return;
    }

    const playPromise = previewVideo.play();

    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          schedulePosterCapture();
        })
        .catch(() => {
          schedulePosterCapture();
        });
      return;
    }

    schedulePosterCapture();
  };

  const handlePreviewError = () => {
    setPosterState((previousState) =>
      previousState.key === assetKey
        ? {
            key: assetKey,
            url: "",
          }
        : previousState,
    );
  };

  const posterUrl = posterState.key === assetKey ? posterState.url : "";

  return (
    <>
      <video
        key={`preview-${assetKey}`}
        ref={previewVideoRef}
        className="lesson-asset-video-preview"
        src={asset.url}
        preload="auto"
        muted
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        onError={handlePreviewError}
      />
      <video
        key={`player-${assetKey}`}
        className="lesson-asset-video"
        src={asset.url}
        poster={posterUrl || undefined}
        controls
        preload="metadata"
        playsInline
      />
    </>
  );
});

function renderLessonAssetVisual(asset) {
  return (
    <figure
      className={`lesson-asset-embed asset-${asset.type}${
        !asset.isResolved ? " is-unavailable" : ""
      }`}
    >
      {asset.type === "image" ? (
        <div className="lesson-asset-visual-wrap">
          {asset.isResolved ? (
            <img
              src={asset.url}
              alt="Иллюстрация к уроку"
              className="lesson-asset-image"
              loading="lazy"
            />
          ) : (
            <div className="lesson-asset-unavailable">
              Не удалось определить адрес изображения.
            </div>
          )}
        </div>
      ) : null}

      {asset.type === "video" ? (
        <div className="lesson-asset-visual-wrap">
          {asset.isResolved ? (
            <LessonAssetVideo asset={asset} />
          ) : (
            <div className="lesson-asset-unavailable">
              Не удалось определить адрес видео.
            </div>
          )}
        </div>
      ) : null}
    </figure>
  );
}

function renderLessonFileAsset(asset) {
  return asset.isResolved ? (
    <a
      key={asset.id}
      href={asset.url}
      target="_blank"
      rel="noreferrer"
      className="lesson-asset-file-link"
    >
      Открыть файл
    </a>
  ) : (
    <div
      key={asset.id}
      className={`lesson-asset-embed asset-file${
        !asset.isResolved ? " is-unavailable" : ""
      }`}
    >
      <div className="lesson-asset-unavailable">Не удалось загрузить файл.</div>
    </div>
  );
}

const LessonMediaCarousel = memo(function LessonMediaCarousel({ assets }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!assets.length) {
    return null;
  }

  const safeIndex = Math.min(activeIndex, assets.length - 1);
  const hasMultipleAssets = assets.length > 1;
  const trackStyle = {
    transform: `translate3d(-${safeIndex * 100}%, 0, 0)`,
  };

  function goToPreviousSlide() {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? assets.length - 1 : currentIndex - 1,
    );
  }

  function goToNextSlide() {
    setActiveIndex((currentIndex) =>
      currentIndex === assets.length - 1 ? 0 : currentIndex + 1,
    );
  }

  return (
    <div className="lesson-media-carousel">
      <div className="lesson-media-carousel-stage">
        <div className="lesson-media-carousel-track" style={trackStyle}>
          {assets.map((asset, index) => (
            <div
              key={asset.id ?? `${asset.type ?? "lesson-asset"}-${index}`}
              className="lesson-media-carousel-slide"
            >
              {renderLessonAssetVisual(asset)}
            </div>
          ))}
        </div>

        {hasMultipleAssets ? (
          <>
            <button
              type="button"
              className="lesson-media-carousel-control previous"
              onClick={goToPreviousSlide}
              aria-label="Предыдущее медиа"
            >
              ‹
            </button>

            <button
              type="button"
              className="lesson-media-carousel-control next"
              onClick={goToNextSlide}
              aria-label="Следующее медиа"
            >
              ›
            </button>

            <div className="lesson-media-carousel-counter" aria-live="polite">
              {safeIndex + 1} / {assets.length}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
});

function renderLessonAssets(assets) {
  if (!assets?.length) {
    return null;
  }

  const mediaAssets = assets.filter(
    (asset) => asset.type === "image" || asset.type === "video",
  );
  const fileAssets = assets.filter((asset) => asset.type === "file");
  const mediaAssetSetKey = mediaAssets
    .map((asset) => `${asset.id ?? "lesson-asset"}:${asset.url ?? asset.type}`)
    .join("|");

  return (
    <>
      {mediaAssets.length ? (
        <LessonMediaCarousel key={mediaAssetSetKey} assets={mediaAssets} />
      ) : null}
      {fileAssets.length ? (
        <div className="lesson-asset-file-list">
          {fileAssets.map(renderLessonFileAsset)}
        </div>
      ) : null}
    </>
  );
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
  const renderedLessonAssets = useMemo(
    () => renderLessonAssets(lessonAssets),
    [lessonAssets],
  );
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
              {renderedLessonAssets}
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
