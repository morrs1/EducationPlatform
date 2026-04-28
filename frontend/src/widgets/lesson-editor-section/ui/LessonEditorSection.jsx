import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router";

import {
  mapReadLessonByIdResponseToLessonEditorData,
  requestLessonById,
  requestUploadLessonAsset,
  requestUploadLessonContent,
} from "../../../entities/course/model/courseServiceApi";
import { parseLessonMarkdown } from "../../../entities/lesson/model/parseLessonMarkdown";
import LessonMarkdownPreview from "../../../entities/lesson/ui/LessonMarkdownPreview";

function getLessonTypeLabel(type) {
  if (type === "quiz") {
    return "Тест";
  }

  if (type === "coding") {
    return "Код";
  }

  return "Теория";
}

function getAssetTypeLabel(assetType) {
  if (assetType === "cover") {
    return "Обложка";
  }

  if (assetType === "image") {
    return "Изображение";
  }

  if (assetType === "video") {
    return "Видео";
  }

  return "Файл";
}

function getInitials(value) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("") || "LS";
}

function formatDateTimeLabel(value) {
  if (!value) {
    return "Дата ещё не пришла";
  }

  try {
    return new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function createQuizOption(text = "", isCorrect = false) {
  return {
    id: crypto.randomUUID(),
    text,
    isCorrect,
  };
}

function createQuizQuestion(index = 1) {
  return {
    id: crypto.randomUUID(),
    type: "single_choice",
    text: `Вопрос ${index}`,
    options: [
      createQuizOption("Вариант 1", true),
      createQuizOption("Вариант 2", false),
    ],
  };
}

function deriveAssetTypeFromFile(file, preferredAssetType = "") {
  if (preferredAssetType) {
    return preferredAssetType;
  }

  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  return "file";
}

function normalizeQuestionForSave(question, questionIndex) {
  const normalizedOptions = question.options
    .map((option, optionIndex) => ({
      id: option.id || crypto.randomUUID(),
      text: option.text.trim() || `Вариант ${optionIndex + 1}`,
      isCorrect: Boolean(option.isCorrect),
    }))
    .filter((option) => option.text.trim());

  return {
    id: question.id || crypto.randomUUID(),
    type: question.type === "multiple_choice" ? "multiple_choice" : "single_choice",
    text: question.text.trim() || `Вопрос ${questionIndex + 1}`,
    options: normalizedOptions,
  };
}

function buildLessonContentPayload(lessonType, state) {
  if (lessonType === "quiz") {
    return {
      introMarkdown: state.markdownValue,
      questions: state.quizQuestions.map(normalizeQuestionForSave),
    };
  }

  if (lessonType === "coding") {
    return {
      taskMarkdown: state.markdownValue,
      checkerType: state.codingState?.checkerType || "stdin_stdout",
      languages: (state.codingState?.languages ?? []).map((language) => ({
        language: language.language || "java",
        starterCode: language.starterCode || "",
      })),
      testCases: (state.codingState?.testCases ?? []).map((testCase) => ({
        id: testCase.id || crypto.randomUUID(),
        isPublic: Boolean(testCase.isPublic),
        input: testCase.input || "",
        expectedOutput: testCase.expectedOutput || "",
      })),
    };
  }

  return {
    markdown: state.markdownValue,
  };
}

function buildEditorSnapshot(lessonType, state) {
  return JSON.stringify(buildLessonContentPayload(lessonType, state));
}

function getLessonValidationError(lessonType, state) {
  if (lessonType !== "quiz") {
    return "";
  }

  if (!state.quizQuestions.length) {
    return "Для тестового урока добавьте хотя бы один вопрос.";
  }

  for (let questionIndex = 0; questionIndex < state.quizQuestions.length; questionIndex += 1) {
    const question = state.quizQuestions[questionIndex];
    const title = question.text.trim();

    if (!title) {
      return `Заполните текст вопроса ${questionIndex + 1}.`;
    }

    const nonEmptyOptions = question.options.filter((option) =>
      option.text.trim(),
    );

    if (nonEmptyOptions.length < 2) {
      return `У вопроса ${questionIndex + 1} нужно минимум два варианта ответа.`;
    }

    const correctOptionsCount = nonEmptyOptions.filter(
      (option) => option.isCorrect,
    ).length;

    if (correctOptionsCount === 0) {
      return `Отметьте хотя бы один правильный вариант у вопроса ${questionIndex + 1}.`;
    }

    if (question.type === "single_choice" && correctOptionsCount > 1) {
      return `У вопроса ${questionIndex + 1} для режима "Один" должен быть ровно один правильный ответ.`;
    }
  }

  return "";
}

function getEditorStateFromLesson(lesson) {
  const markdownValue = lesson.contentMarkdown || "";
  const quizQuestions = lesson.questions ?? [];

  return {
    markdownValue,
    quizQuestions,
    snapshot: buildEditorSnapshot(lesson.type, {
      markdownValue,
      quizQuestions,
      codingState: lesson.coding,
    }),
  };
}

function wrapSelection(value, start, end, before, after = before, placeholder) {
  const selectedText = value.slice(start, end);
  const content = selectedText || placeholder;
  const nextValue =
    value.slice(0, start) +
    before +
    content +
    after +
    value.slice(end);
  const selectionStart = start + before.length;
  const selectionEnd = selectionStart + content.length;

  return {
    value: nextValue,
    selectionStart,
    selectionEnd,
  };
}

function prefixSelectedLines(value, start, end, prefixBuilder) {
  const blockStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const blockEnd = value.indexOf("\n", end);
  const safeBlockEnd = blockEnd === -1 ? value.length : blockEnd;
  const selectedBlock = value.slice(blockStart, safeBlockEnd);
  const nextBlock = selectedBlock
    .split("\n")
    .map((line, index) => prefixBuilder(line, index))
    .join("\n");
  const nextValue =
    value.slice(0, blockStart) + nextBlock + value.slice(safeBlockEnd);

  return {
    value: nextValue,
    selectionStart: blockStart,
    selectionEnd: blockStart + nextBlock.length,
  };
}

function insertLink(value, start, end) {
  const selectedText = value.slice(start, end) || "ссылка";

  return {
    value:
      value.slice(0, start) +
      `[${selectedText}](https://example.com)` +
      value.slice(end),
    selectionStart: start + 1,
    selectionEnd: start + 1 + selectedText.length,
  };
}

function insertCodeBlock(value, start, end) {
  const selectedText = value.slice(start, end);
  const blockContent = selectedText || "console.log('hello');";
  const prefix = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
  const suffix = end < value.length && value[end] !== "\n" ? "\n" : "";
  const replacement = `${prefix}\`\`\`md\n${blockContent}\n\`\`\`${suffix}`;
  const nextValue = value.slice(0, start) + replacement + value.slice(end);
  const codeStart = start + prefix.length + 6;

  return {
    value: nextValue,
    selectionStart: codeStart,
    selectionEnd: codeStart + blockContent.length,
  };
}

function MarkdownEditor({
  value,
  onChange,
  disabled = false,
}) {
  const textareaRef = useRef(null);
  const blocks = useMemo(() => parseLessonMarkdown(value), [value]);

  function applyTransform(transformer) {
    const textarea = textareaRef.current;

    if (!textarea || disabled) {
      return;
    }

    const result = transformer(
      value,
      textarea.selectionStart,
      textarea.selectionEnd,
    );

    onChange(result.value);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  return (
    <div className="lesson-rich-editor">
      <div className="lesson-rich-editor-toolbar">
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              prefixSelectedLines(currentValue, start, end, (line) =>
                line.startsWith("# ") ? line : `# ${line}`,
              ),
            )
          }
          disabled={disabled}
        >
          H1
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              prefixSelectedLines(currentValue, start, end, (line) =>
                line.startsWith("## ") ? line : `## ${line}`,
              ),
            )
          }
          disabled={disabled}
        >
          H2
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              wrapSelection(currentValue, start, end, "**", "**", "жирный текст"),
            )
          }
          disabled={disabled}
        >
          B
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              wrapSelection(currentValue, start, end, "*", "*", "курсив"),
            )
          }
          disabled={disabled}
        >
          I
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              wrapSelection(currentValue, start, end, "`", "`", "code"),
            )
          }
          disabled={disabled}
        >
          ``
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              prefixSelectedLines(currentValue, start, end, (line) =>
                line.startsWith("> ") ? line : `> ${line}`,
              ),
            )
          }
          disabled={disabled}
        >
          Quote
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              prefixSelectedLines(currentValue, start, end, (line) =>
                line.startsWith("- ") ? line : `- ${line}`,
              ),
            )
          }
          disabled={disabled}
        >
          • List
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              prefixSelectedLines(currentValue, start, end, (_line, index) =>
                `${index + 1}. ${_line}`,
              ),
            )
          }
          disabled={disabled}
        >
          1. List
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              insertCodeBlock(currentValue, start, end),
            )
          }
          disabled={disabled}
        >
          Block
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() =>
            applyTransform((currentValue, start, end) =>
              insertLink(currentValue, start, end),
            )
          }
          disabled={disabled}
        >
          Link
        </button>
      </div>

      <div className="lesson-rich-editor-panels">
        <div className="lesson-rich-editor-panel">
          <div className="lesson-rich-editor-panel-head">
            <strong>Markdown</strong>
            <span>Сохраняем в backend как md-строку</span>
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="lesson-rich-editor-source"
            spellCheck={false}
            disabled={disabled}
            placeholder="Напишите содержание урока в Markdown..."
          />
        </div>

        <div className="lesson-rich-editor-panel">
          <div className="lesson-rich-editor-panel-head">
            <strong>Предпросмотр</strong>
            <span>Так текст увидит студент</span>
          </div>
          <div className="lesson-rich-editor-preview-shell">
            {blocks.length ? (
              <LessonMarkdownPreview
                blocks={blocks}
                className="lesson-markdown lesson-rich-editor-preview"
              />
            ) : (
              <div className="lesson-editor-empty-panel compact">
                <strong className="lesson-editor-empty-panel-title">
                  Пока пусто
                </strong>
                <p className="lesson-editor-empty-panel-text">
                  Добавьте заголовки, текст, списки и блоки кода, чтобы сразу
                  увидеть, как урок будет выглядеть после сохранения.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonAssetsManager({
  assets,
  onUploadFiles,
  uploadState,
  uploadMessage,
  disabled = false,
}) {
  const fileInputRef = useRef(null);

  function handleFilesSelected(event) {
    const nextFiles = Array.from(event.target.files ?? []);

    if (nextFiles.length) {
      onUploadFiles(nextFiles);
    }

    event.target.value = "";
  }

  return (
    <section className="lesson-editor-block">
      <div className="lesson-editor-block-head">
        <div>
          <span className="lesson-editor-block-kicker">АССЕТЫ</span>
          <h2 className="lesson-editor-block-title">Материалы урока</h2>
          <p className="lesson-editor-block-subtext">
            Изображения, видео и файлы уже можно отправлять в backend. Они сразу
            прикрепляются к уроку.
          </p>
        </div>

        <button
          type="button"
          className="lesson-editor-secondary-action"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploadState === "uploading"}
        >
          {uploadState === "uploading" ? "Загружаем..." : "Добавить файлы"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleFilesSelected}
      />

      {uploadMessage ? (
        <p className={`course-inline-feedback${uploadState === "error" ? " error" : ""}`}>
          {uploadMessage}
        </p>
      ) : null}

      {assets.length ? (
        <div className="lesson-editor-asset-list">
          {assets.map((asset) => (
            <article key={asset.id} className="lesson-editor-asset-card">
              <div className="lesson-editor-asset-copy">
                <div className="lesson-editor-asset-head">
                  <strong className="lesson-editor-asset-name">{asset.title}</strong>
                  <span className="lesson-editor-asset-badge">
                    {getAssetTypeLabel(asset.assetType)}
                  </span>
                </div>
                <span className="lesson-editor-asset-meta">
                  {asset.originalFilename || asset.title}
                  {asset.mimeType ? ` · ${asset.mimeType}` : ""}
                </span>
              </div>

              {asset.isResolved ? (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="lesson-editor-asset-open-link"
                >
                  Открыть
                </a>
              ) : (
                <span className="lesson-editor-asset-meta">
                  Ссылка пока не определилась
                </span>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="lesson-editor-empty-panel">
          <strong className="lesson-editor-empty-panel-title">
            Пока без файлов
          </strong>
          <p className="lesson-editor-empty-panel-text">
            Можно прикрепить изображения, видео, PDF и любые дополнительные
            материалы. Они сразу появятся в lesson API.
          </p>
        </div>
      )}
    </section>
  );
}

function LessonQuizBuilder({ questions, onChange }) {
  function updateQuestion(questionId, patch) {
    onChange((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              ...patch,
            }
          : question,
      ),
    );
  }

  function removeQuestion(questionId) {
    onChange((currentQuestions) =>
      currentQuestions.filter((question) => question.id !== questionId),
    );
  }

  function addQuestion() {
    onChange((currentQuestions) => [
      ...currentQuestions,
      createQuizQuestion(currentQuestions.length + 1),
    ]);
  }

  function updateOption(questionId, optionId, patch) {
    onChange((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId
                  ? {
                      ...option,
                      ...patch,
                    }
                  : option,
              ),
            }
          : question,
      ),
    );
  }

  function addOption(questionId) {
    onChange((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: [
                ...question.options,
                createQuizOption(`Вариант ${question.options.length + 1}`),
              ],
            }
          : question,
      ),
    );
  }

  function removeOption(questionId, optionId) {
    onChange((currentQuestions) =>
      currentQuestions.map((question) => {
        if (question.id !== questionId || question.options.length <= 2) {
          return question;
        }

        return {
          ...question,
          options: question.options.filter((option) => option.id !== optionId),
        };
      }),
    );
  }

  function moveOption(questionId, optionId, direction) {
    onChange((currentQuestions) =>
      currentQuestions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const optionIndex = question.options.findIndex(
          (option) => option.id === optionId,
        );

        if (optionIndex < 0) {
          return question;
        }

        const nextIndex = direction === "up" ? optionIndex - 1 : optionIndex + 1;

        if (nextIndex < 0 || nextIndex >= question.options.length) {
          return question;
        }

        const nextOptions = [...question.options];
        const [movedOption] = nextOptions.splice(optionIndex, 1);
        nextOptions.splice(nextIndex, 0, movedOption);

        return {
          ...question,
          options: nextOptions,
        };
      }),
    );
  }

  function toggleCorrectOption(questionId, optionId) {
    onChange((currentQuestions) =>
      currentQuestions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        if (question.type === "multiple_choice") {
          return {
            ...question,
            options: question.options.map((option) =>
              option.id === optionId
                ? {
                    ...option,
                    isCorrect: !option.isCorrect,
                  }
                : option,
            ),
          };
        }

        return {
          ...question,
          options: question.options.map((option) => ({
            ...option,
            isCorrect: option.id === optionId,
          })),
        };
      }),
    );
  }

  if (!questions.length) {
    return (
      <section className="lesson-editor-block">
        <div className="lesson-editor-block-head">
          <div>
            <span className="lesson-editor-block-kicker">QUIZ</span>
            <h2 className="lesson-editor-block-title">Вопросы теста</h2>
            <p className="lesson-editor-block-subtext">
              У quiz-урока можно сразу собрать список вопросов и отметить
              правильные варианты.
            </p>
          </div>

          <button
            type="button"
            className="lesson-editor-primary-action"
            onClick={addQuestion}
          >
            + Добавить вопрос
          </button>
        </div>

        <div className="lesson-editor-empty-panel">
          <strong className="lesson-editor-empty-panel-title">
            Пока без вопросов
          </strong>
          <p className="lesson-editor-empty-panel-text">
            Добавьте первый вопрос, чтобы собрать структуру quiz-урока перед
            сохранением в backend.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="lesson-editor-block">
      <div className="lesson-editor-block-head">
        <div>
          <span className="lesson-editor-block-kicker">QUIZ</span>
          <h2 className="lesson-editor-block-title">Вопросы теста</h2>
          <p className="lesson-editor-block-subtext">
            Поддерживаем одиночный и множественный выбор. Объяснения после
            неверного ответа пока не используем, как и договаривались.
          </p>
        </div>

        <button
          type="button"
          className="lesson-editor-primary-action"
          onClick={addQuestion}
        >
          + Добавить вопрос
        </button>
      </div>

      <div className="lesson-quiz-question-list">
        {questions.map((question, questionIndex) => (
          <article key={question.id} className="lesson-quiz-question-card">
            <div className="lesson-quiz-question-head">
              <div className="lesson-quiz-question-head-copy">
                <span className="lesson-editor-block-kicker">
                  Вопрос {questionIndex + 1}
                </span>
                <input
                  type="text"
                  value={question.text}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      text: event.target.value,
                    })
                  }
                  className="lesson-editor-input"
                  placeholder={`Текст вопроса ${questionIndex + 1}`}
                />
              </div>

              <button
                type="button"
                className="lesson-editor-secondary-action"
                onClick={() => removeQuestion(question.id)}
              >
                Удалить вопрос
              </button>
            </div>

            <div className="lesson-editor-field">
              <span className="lesson-editor-field-title">
                Количество правильных ответов
              </span>
              <div className="lesson-quiz-mode-toggle">
                <button
                  type="button"
                  className={`lesson-quiz-mode-button${question.type === "single_choice" ? " is-active" : ""}`}
                  onClick={() =>
                    updateQuestion(question.id, {
                      type: "single_choice",
                      options: question.options.map((option, optionIndex) => ({
                        ...option,
                        isCorrect:
                          optionIndex ===
                          question.options.findIndex((item) => item.isCorrect),
                      })),
                    })
                  }
                >
                  Один
                </button>
                <button
                  type="button"
                  className={`lesson-quiz-mode-button${question.type === "multiple_choice" ? " is-active" : ""}`}
                  onClick={() =>
                    updateQuestion(question.id, {
                      type: "multiple_choice",
                    })
                  }
                >
                  Несколько
                </button>
              </div>
            </div>

            <div className="lesson-editor-block-subhead">
              <strong className="lesson-editor-block-subtitle">
                Варианты ответа
              </strong>
              <p className="lesson-editor-block-subtext">
                Отметьте один или несколько правильных вариантов и при
                необходимости перестройте порядок.
              </p>
            </div>

            <div className="lesson-quiz-option-list">
              {question.options.map((option, optionIndex) => (
                <article key={option.id} className="lesson-quiz-option-card">
                  <button
                    type="button"
                    className={`lesson-quiz-option-selector${option.isCorrect ? " is-active" : ""}`}
                    onClick={() => toggleCorrectOption(question.id, option.id)}
                    aria-pressed={option.isCorrect}
                  >
                    {question.type === "multiple_choice" ? "☑" : "◉"}
                  </button>

                  <input
                    type="text"
                    value={option.text}
                    onChange={(event) =>
                      updateOption(question.id, option.id, {
                        text: event.target.value,
                      })
                    }
                    className="lesson-quiz-option-input"
                    placeholder={`Вариант ${optionIndex + 1}`}
                  />

                  <div className="lesson-quiz-option-actions">
                    <button
                      type="button"
                      className="lesson-quiz-option-action"
                      onClick={() => moveOption(question.id, option.id, "up")}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="lesson-quiz-option-action"
                      onClick={() => moveOption(question.id, option.id, "down")}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="lesson-quiz-option-action danger"
                      onClick={() => removeOption(question.id, option.id)}
                    >
                      ✕
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="lesson-editor-secondary-action"
              onClick={() => addOption(question.id)}
            >
              + Добавить вариант ответа
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function LessonCodingSummary({ coding }) {
  return (
    <section className="lesson-editor-block">
      <div className="lesson-editor-block-head">
        <div>
          <span className="lesson-editor-block-kicker">CODE</span>
          <h2 className="lesson-editor-block-title">Технические настройки</h2>
          <p className="lesson-editor-block-subtext">
            Для кодовых уроков пока сохраняем текст задания и ассеты, а
            существующие тесты и языки просто показываем как уже пришедшие из
            backend.
          </p>
        </div>
      </div>

      <div className="lesson-editor-coding-grid">
        <div className="lesson-editor-info-tile">
          <span className="lesson-editor-info-label">Checker</span>
          <strong className="lesson-editor-info-value">
            {coding?.checkerType || "stdin_stdout"}
          </strong>
        </div>
        <div className="lesson-editor-info-tile">
          <span className="lesson-editor-info-label">Языков</span>
          <strong className="lesson-editor-info-value">
            {coding?.languages?.length ?? 0}
          </strong>
        </div>
        <div className="lesson-editor-info-tile">
          <span className="lesson-editor-info-label">Тест-кейсов</span>
          <strong className="lesson-editor-info-value">
            {coding?.testCases?.length ?? 0}
          </strong>
        </div>
      </div>
    </section>
  );
}

function LessonEditorWorkspace({
  course,
  courseId,
  activeModule,
  editorLesson,
  markdownValue,
  onMarkdownChange,
  quizQuestions,
  onQuizQuestionsChange,
  onSave,
  onRefresh,
  onUploadCover,
  onUploadAssets,
  saveState,
  saveMessage,
  coverUploadState,
  coverUploadMessage,
  assetUploadState,
  assetUploadMessage,
  hasUnsavedChanges,
  localCoverPreviewUrl,
}) {
  const coverInputRef = useRef(null);
  const coverSource =
    localCoverPreviewUrl || editorLesson.coverAsset?.url || "";
  const titleInitials = getInitials(editorLesson.title);

  function handleCoverSelected(event) {
    const file = event.target.files?.[0];

    if (file) {
      onUploadCover(file);
    }

    event.target.value = "";
  }

  return (
    <>
      <header className="lesson-editor-hero">
        <div className="lesson-editor-hero-copy">
          <span className="lesson-editor-kicker">РЕДАКТОР УРОКА</span>
          <h1 className="lesson-editor-title">Настройки урока</h1>
          <p className="lesson-editor-description">
            {course?.title || "Курс"} · {activeModule?.title || "Модуль"} ·{" "}
            {getLessonTypeLabel(editorLesson.type)}
          </p>
        </div>

        <div className="lesson-editor-hero-actions">
          <Link
            to={`/courses/${courseId}/lessons/${editorLesson.id}`}
            className="lesson-editor-secondary-action"
          >
            Открыть урок
          </Link>

          <button
            type="button"
            className="lesson-editor-secondary-action"
            onClick={onRefresh}
            disabled={saveState === "saving"}
          >
            Обновить
          </button>

          <button
            type="button"
            className="lesson-editor-primary-action"
            onClick={onSave}
            disabled={saveState === "saving" || !hasUnsavedChanges}
          >
            {saveState === "saving"
              ? "Сохраняем..."
              : hasUnsavedChanges
                ? "Сохранить урок"
                : "Сохранено"}
          </button>
        </div>
      </header>

      {saveMessage ? (
        <p className={`course-inline-feedback${saveState === "error" ? " error" : ""}`}>
          {saveMessage}
        </p>
      ) : null}

      <section className="lesson-editor-top-card">
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleCoverSelected}
        />

        <button
          type="button"
          className="lesson-editor-cover-trigger"
          onClick={() => coverInputRef.current?.click()}
          disabled={coverUploadState === "uploading"}
        >
          {coverSource ? (
            <img
              src={coverSource}
              alt="Обложка урока"
              className="lesson-editor-cover-image"
            />
          ) : (
            <span className="lesson-editor-cover-placeholder">{titleInitials}</span>
          )}
          <span className="lesson-editor-cover-overlay">
            {coverUploadState === "uploading" ? "Загружаем..." : "Сменить обложку"}
          </span>
        </button>

        <div className="lesson-editor-top-fields">
          <div className="lesson-editor-title-row">
            <input
              type="text"
              value={editorLesson.title}
              readOnly
              className="lesson-editor-title-input is-readonly"
            />
          </div>

          <p className="lesson-editor-inline-note">
            Название урока пока читаем из backend. Сейчас можно полноценно
            редактировать содержимое, quiz-структуру, cover и lesson assets.
          </p>

          <div className="lesson-editor-top-meta">
            <span className="lesson-editor-meta-pill">
              {getLessonTypeLabel(editorLesson.type)}
            </span>
            <span className="lesson-editor-meta-pill">
              {editorLesson.durationLabel}
            </span>
            {editorLesson.isPreview ? (
              <span className="lesson-editor-meta-pill">Превью-урок</span>
            ) : null}
            <span className="lesson-editor-meta-pill">
              Обновлено: {formatDateTimeLabel(editorLesson.updatedAt)}
            </span>
          </div>

          {coverUploadMessage ? (
            <p
              className={`course-inline-feedback${coverUploadState === "error" ? " error" : ""}`}
            >
              {coverUploadMessage}
            </p>
          ) : null}
        </div>
      </section>

      <section className="lesson-editor-block">
        <div className="lesson-editor-block-head">
          <div>
            <span className="lesson-editor-block-kicker">СОДЕРЖАНИЕ</span>
            <h2 className="lesson-editor-block-title">
              {editorLesson.type === "quiz" ? "Текст тестового урока" : "Текст урока"}
            </h2>
            <p className="lesson-editor-block-subtext">
              Этот текст хранится как markdown и уходит в `course_service`
              без промежуточного HTML.
            </p>
          </div>
        </div>

        <MarkdownEditor
          value={markdownValue}
          onChange={onMarkdownChange}
          disabled={saveState === "saving"}
        />
      </section>

      <LessonAssetsManager
        assets={editorLesson.assets}
        onUploadFiles={onUploadAssets}
        uploadState={assetUploadState}
        uploadMessage={assetUploadMessage}
        disabled={saveState === "saving"}
      />

      {editorLesson.type === "quiz" ? (
        <LessonQuizBuilder
          questions={quizQuestions}
          onChange={onQuizQuestionsChange}
        />
      ) : null}

      {editorLesson.type === "coding" ? (
        <LessonCodingSummary coding={editorLesson.coding} />
      ) : null}
    </>
  );
}

function LessonEditorSection() {
  const {
    courseId,
    course,
    pageStatus,
    pageError,
    reloadCourse,
    activeLesson,
    activeModule,
  } = useOutletContext();
  const [editorStatus, setEditorStatus] = useState("idle");
  const [editorError, setEditorError] = useState("");
  const [editorLesson, setEditorLesson] = useState(null);
  const [markdownValue, setMarkdownValue] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [reloadSeed, setReloadSeed] = useState(0);
  const [saveState, setSaveState] = useState("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [coverUploadState, setCoverUploadState] = useState("idle");
  const [coverUploadMessage, setCoverUploadMessage] = useState("");
  const [assetUploadState, setAssetUploadState] = useState("idle");
  const [assetUploadMessage, setAssetUploadMessage] = useState("");
  const [localCoverPreviewUrl, setLocalCoverPreviewUrl] = useState("");
  const localCoverPreviewUrlRef = useRef("");

  useEffect(() => {
    localCoverPreviewUrlRef.current = localCoverPreviewUrl;
  }, [localCoverPreviewUrl]);

  useEffect(() => {
    return () => {
      if (localCoverPreviewUrlRef.current) {
        URL.revokeObjectURL(localCoverPreviewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadEditorLesson() {
      if (!activeLesson?.id) {
        if (!isCancelled) {
          setEditorStatus("idle");
          setEditorError("");
          setEditorLesson(null);
          setMarkdownValue("");
          setQuizQuestions([]);
          setSavedSnapshot("");
        }
        return;
      }

      setEditorStatus("loading");
      setEditorError("");
      setSaveState("idle");
      setSaveMessage("");
      setAssetUploadMessage("");
      setCoverUploadMessage("");

      try {
        const lessonResponse = await requestLessonById(activeLesson.id);
        const nextEditorLesson = mapReadLessonByIdResponseToLessonEditorData({
          courseId,
          lessonId: activeLesson.id,
          module: activeModule,
          lessonPreview: activeLesson,
          lessonResponse,
        });
        const nextState = getEditorStateFromLesson(nextEditorLesson);

        if (!isCancelled) {
          setEditorLesson(nextEditorLesson);
          setMarkdownValue(nextState.markdownValue);
          setQuizQuestions(nextState.quizQuestions);
          setSavedSnapshot(nextState.snapshot);
          setEditorStatus("success");
          setEditorError("");

          if (localCoverPreviewUrlRef.current) {
            URL.revokeObjectURL(localCoverPreviewUrlRef.current);
            localCoverPreviewUrlRef.current = "";
            setLocalCoverPreviewUrl("");
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setEditorStatus("error");
          setEditorError(
            error?.message ?? "Не удалось загрузить lesson payload из backend.",
          );
          setEditorLesson(null);
        }
      }
    }

    loadEditorLesson();

    return () => {
      isCancelled = true;
    };
  }, [
    activeLesson,
    activeModule,
    courseId,
    reloadSeed,
  ]);

  const currentSnapshot = useMemo(() => {
    if (!editorLesson) {
      return "";
    }

    return buildEditorSnapshot(editorLesson.type, {
      markdownValue,
      quizQuestions,
      codingState: editorLesson.coding,
    });
  }, [editorLesson, markdownValue, quizQuestions]);

  const hasUnsavedChanges =
    editorStatus === "success" &&
    Boolean(editorLesson) &&
    currentSnapshot !== savedSnapshot;

  async function refreshEditorLessonWithBackendMessages(successMessage) {
    if (!activeLesson?.id) {
      return;
    }

    const lessonResponse = await requestLessonById(activeLesson.id);
    const nextEditorLesson = mapReadLessonByIdResponseToLessonEditorData({
      courseId,
      lessonId: activeLesson.id,
      module: activeModule,
      lessonPreview: activeLesson,
      lessonResponse,
    });
    const nextState = getEditorStateFromLesson(nextEditorLesson);

    setEditorLesson(nextEditorLesson);
    setMarkdownValue(nextState.markdownValue);
    setQuizQuestions(nextState.quizQuestions);
    setSavedSnapshot(nextState.snapshot);
    setEditorStatus("success");
    setEditorError("");

    if (localCoverPreviewUrlRef.current) {
      URL.revokeObjectURL(localCoverPreviewUrlRef.current);
      localCoverPreviewUrlRef.current = "";
      setLocalCoverPreviewUrl("");
    }

    if (successMessage) {
      setSaveMessage(successMessage);
    }
  }

  async function handleSave() {
    if (!editorLesson) {
      return;
    }

    const validationError = getLessonValidationError(editorLesson.type, {
      markdownValue,
      quizQuestions,
    });

    if (validationError) {
      setSaveState("error");
      setSaveMessage(validationError);
      return;
    }

    setSaveState("saving");
    setSaveMessage("");

    try {
      const content = buildLessonContentPayload(editorLesson.type, {
        markdownValue,
        quizQuestions,
        codingState: editorLesson.coding,
      });

      await requestUploadLessonContent(editorLesson.id, { content });
      await refreshEditorLessonWithBackendMessages(
        "Содержимое урока сохранено в course_service.",
      );
      setSaveState("success");
    } catch (error) {
      setSaveState("error");
      setSaveMessage(
        error?.message ?? "Не удалось сохранить содержимое урока в backend.",
      );
    }
  }

  async function handleUploadCover(file) {
    if (!editorLesson) {
      return;
    }

    if (localCoverPreviewUrl) {
      URL.revokeObjectURL(localCoverPreviewUrl);
    }

    setLocalCoverPreviewUrl(URL.createObjectURL(file));
    setCoverUploadState("uploading");
    setCoverUploadMessage("");

    try {
      await requestUploadLessonAsset(editorLesson.id, {
        file,
        title: `${editorLesson.title} — обложка`,
        assetType: "cover",
      });
      await refreshEditorLessonWithBackendMessages("");
      setCoverUploadState("success");
      setCoverUploadMessage("Обложка урока загружена в backend.");
    } catch (error) {
      setCoverUploadState("error");
      setCoverUploadMessage(
        error?.message ?? "Не удалось загрузить обложку урока.",
      );
    }
  }

  async function handleUploadAssets(files) {
    if (!editorLesson || !files.length) {
      return;
    }

    setAssetUploadState("uploading");
    setAssetUploadMessage("");

    try {
      await Promise.all(
        files.map((file) =>
          requestUploadLessonAsset(editorLesson.id, {
            file,
            title: file.name,
            assetType: deriveAssetTypeFromFile(file),
          }),
        ),
      );
      await refreshEditorLessonWithBackendMessages("");
      setAssetUploadState("success");
      setAssetUploadMessage(
        files.length === 1
          ? "Материал добавлен к уроку."
          : `К уроку добавлено ${files.length} материалов.`,
      );
    } catch (error) {
      setAssetUploadState("error");
      setAssetUploadMessage(
        error?.message ?? "Не удалось загрузить материалы урока.",
      );
    }
  }

  return (
    <section className="lesson-editor-section">
      {pageStatus === "loading" ? (
        <div className="lesson-editor-empty-state">
          <strong className="lesson-editor-empty-title">
            Загружаем редактор урока
          </strong>
          <p className="lesson-editor-empty-text">
            Подключаем структуру курса и список уроков, чтобы открыть редактор.
          </p>
        </div>
      ) : pageStatus === "error" ? (
        <div className="lesson-editor-empty-state">
          <strong className="lesson-editor-empty-title">
            Не удалось открыть редактор урока
          </strong>
          <p className="lesson-editor-empty-text">
            {pageError || "Курс не загрузился для редактора уроков."}
          </p>
          <button
            type="button"
            className="lesson-editor-primary-action"
            onClick={reloadCourse}
          >
            Повторить запрос
          </button>
        </div>
      ) : !activeLesson ? (
        <div className="lesson-editor-empty-state">
          <strong className="lesson-editor-empty-title">Урок не найден</strong>
          <p className="lesson-editor-empty-text">
            Возможно, этот урок ещё не появился в структуре курса. Вернитесь к
            содержанию и выберите другой урок.
          </p>
        </div>
      ) : editorStatus === "loading" ? (
        <div className="lesson-editor-empty-state">
          <strong className="lesson-editor-empty-title">
            Загружаем lesson payload
          </strong>
          <p className="lesson-editor-empty-text">
            Подтягиваем из backend markdown, assets и тип урока для дальнейшего
            редактирования.
          </p>
        </div>
      ) : editorStatus === "error" || !editorLesson ? (
        <div className="lesson-editor-empty-state">
          <strong className="lesson-editor-empty-title">
            Не удалось открыть урок
          </strong>
          <p className="lesson-editor-empty-text">
            {editorError || "Lesson API не вернул данные по уроку."}
          </p>
          <button
            type="button"
            className="lesson-editor-primary-action"
            onClick={() => setReloadSeed((value) => value + 1)}
          >
            Повторить запрос
          </button>
        </div>
      ) : (
        <LessonEditorWorkspace
          key={editorLesson.id}
          course={course}
          courseId={courseId}
          activeModule={activeModule}
          editorLesson={editorLesson}
          markdownValue={markdownValue}
          onMarkdownChange={setMarkdownValue}
          quizQuestions={quizQuestions}
          onQuizQuestionsChange={setQuizQuestions}
          onSave={handleSave}
          onRefresh={() => setReloadSeed((value) => value + 1)}
          onUploadCover={handleUploadCover}
          onUploadAssets={handleUploadAssets}
          saveState={saveState}
          saveMessage={saveMessage}
          coverUploadState={coverUploadState}
          coverUploadMessage={coverUploadMessage}
          assetUploadState={assetUploadState}
          assetUploadMessage={assetUploadMessage}
          hasUnsavedChanges={hasUnsavedChanges}
          localCoverPreviewUrl={localCoverPreviewUrl}
        />
      )}
    </section>
  );
}

export default LessonEditorSection;
