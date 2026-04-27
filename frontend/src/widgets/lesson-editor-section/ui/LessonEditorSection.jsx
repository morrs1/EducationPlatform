import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";

function getLessonTypeLabel(type) {
  if (type === "quiz") {
    return "Тест";
  }

  if (type === "coding") {
    return "Код";
  }

  return "Теория";
}

function createQuizOption(label = "") {
  return {
    id: crypto.randomUUID(),
    text: label,
    isCorrect: false,
  };
}

function createInitialQuizOptions() {
  return [
    createQuizOption("Вариант 1"),
    createQuizOption("Вариант 2"),
    createQuizOption("Вариант 3"),
    createQuizOption("Вариант 4"),
  ];
}

function LessonRichTextEditor({ lessonTitle }) {
  const editorRef = useRef(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(
    `<p>Здесь можно набросать основное содержание урока <strong>${lessonTitle || "без названия"}</strong>.</p><p>Каркас редактора пока локальный, без сохранения в backend.</p>`,
  );

  useEffect(() => {
    if (!isSourceMode && editorRef.current && editorRef.current.innerHTML !== htmlValue) {
      editorRef.current.innerHTML = htmlValue;
    }
  }, [htmlValue, isSourceMode]);

  function applyCommand(command, value = null) {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    document.execCommand(command, false, value);
    setHtmlValue(editorRef.current.innerHTML);
  }

  function handleLinkInsert() {
    const nextUrl = window.prompt("Введите ссылку");

    if (!nextUrl) {
      return;
    }

    applyCommand("createLink", nextUrl);
  }

  function handleSourceModeToggle() {
    if (!isSourceMode && editorRef.current) {
      setHtmlValue(editorRef.current.innerHTML);
    }

    setIsSourceMode((value) => !value);
  }

  return (
    <section className="lesson-rich-editor">
      <div className="lesson-rich-editor-toolbar">
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() => applyCommand("bold")}
        >
          B
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() => applyCommand("italic")}
        >
          I
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() => applyCommand("underline")}
        >
          U
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() => applyCommand("formatBlock", "blockquote")}
        >
          “”
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() => applyCommand("insertUnorderedList")}
        >
          • List
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() => applyCommand("insertOrderedList")}
        >
          1. List
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() => applyCommand("formatBlock", "pre")}
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={handleLinkInsert}
        >
          Link
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() => applyCommand("justifyLeft")}
        >
          Left
        </button>
        <button
          type="button"
          className="lesson-rich-editor-tool"
          onClick={() => applyCommand("justifyCenter")}
        >
          Center
        </button>
        <button
          type="button"
          className={`lesson-rich-editor-tool${isSourceMode ? " is-active" : ""}`}
          onClick={handleSourceModeToggle}
        >
          Source
        </button>
      </div>

      {isSourceMode ? (
        <textarea
          value={htmlValue}
          onChange={(event) => setHtmlValue(event.target.value)}
          className="lesson-rich-editor-source"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="lesson-rich-editor-content"
          onInput={(event) => setHtmlValue(event.currentTarget.innerHTML)}
        />
      )}
    </section>
  );
}

function LessonAssetsManager() {
  const fileInputRef = useRef(null);
  const [assetFiles, setAssetFiles] = useState([]);

  function handleFilesSelected(event) {
    const nextFiles = Array.from(event.target.files ?? []).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      sizeLabel:
        file.size >= 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} МБ`
          : `${Math.max(1, Math.round(file.size / 1024))} КБ`,
    }));

    setAssetFiles((currentFiles) => [...currentFiles, ...nextFiles]);
    event.target.value = "";
  }

  function handleAssetRemove(assetId) {
    setAssetFiles((currentFiles) =>
      currentFiles.filter((asset) => asset.id !== assetId),
    );
  }

  return (
    <section className="lesson-editor-block">
      <div className="lesson-editor-block-head">
        <div>
          <span className="lesson-editor-block-kicker">АССЕТЫ</span>
          <h2 className="lesson-editor-block-title">Материалы урока</h2>
        </div>

        <button
          type="button"
          className="lesson-editor-secondary-action"
          onClick={() => fileInputRef.current?.click()}
        >
          Добавить файлы
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleFilesSelected}
      />

      {assetFiles.length ? (
        <div className="lesson-editor-asset-list">
          {assetFiles.map((asset) => (
            <article key={asset.id} className="lesson-editor-asset-card">
              <div className="lesson-editor-asset-copy">
                <strong className="lesson-editor-asset-name">{asset.name}</strong>
                <span className="lesson-editor-asset-meta">{asset.sizeLabel}</span>
              </div>

              <button
                type="button"
                className="lesson-editor-asset-remove"
                onClick={() => handleAssetRemove(asset.id)}
              >
                Удалить
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="lesson-editor-empty-panel">
          <strong className="lesson-editor-empty-panel-title">
            Пока без материалов
          </strong>
          <p className="lesson-editor-empty-panel-text">
            Здесь позже будут файлы, изображения и дополнительные материалы
            урока. Пока можно только набросать интерфейс и локально выбрать
            файлы.
          </p>
        </div>
      )}
    </section>
  );
}

function LessonQuizBuilder() {
  const [points, setPoints] = useState("1");
  const [answersMode, setAnswersMode] = useState("single");
  const [options, setOptions] = useState(createInitialQuizOptions);

  function updateOption(optionId, patch) {
    setOptions((currentOptions) =>
      currentOptions.map((option) =>
        option.id === optionId
          ? {
              ...option,
              ...patch,
            }
          : option,
      ),
    );
  }

  function toggleCorrectOption(optionId) {
    setOptions((currentOptions) => {
      if (answersMode === "multiple") {
        return currentOptions.map((option) =>
          option.id === optionId
            ? { ...option, isCorrect: !option.isCorrect }
            : option,
        );
      }

      return currentOptions.map((option) => ({
        ...option,
        isCorrect: option.id === optionId,
      }));
    });
  }

  function moveOption(optionId, direction) {
    setOptions((currentOptions) => {
      const optionIndex = currentOptions.findIndex(
        (option) => option.id === optionId,
      );

      if (optionIndex < 0) {
        return currentOptions;
      }

      const nextIndex =
        direction === "up" ? optionIndex - 1 : optionIndex + 1;

      if (nextIndex < 0 || nextIndex >= currentOptions.length) {
        return currentOptions;
      }

      const nextOptions = [...currentOptions];
      const [movedOption] = nextOptions.splice(optionIndex, 1);
      nextOptions.splice(nextIndex, 0, movedOption);

      return nextOptions;
    });
  }

  function removeOption(optionId) {
    setOptions((currentOptions) => {
      if (currentOptions.length <= 2) {
        return currentOptions;
      }

      return currentOptions.filter((option) => option.id !== optionId);
    });
  }

  function handleAnswerModeChange(nextMode) {
    setAnswersMode(nextMode);

    if (nextMode === "single") {
      let hasCorrectOption = false;

      setOptions((currentOptions) =>
        currentOptions.map((option) => {
          if (option.isCorrect && !hasCorrectOption) {
            hasCorrectOption = true;

            return option;
          }

          if (option.isCorrect && hasCorrectOption) {
            return {
              ...option,
              isCorrect: false,
            };
          }

          return option;
        }),
      );
    }
  }

  return (
    <section className="lesson-editor-block">
      <div className="lesson-editor-block-head">
        <div>
          <span className="lesson-editor-block-kicker">QUIZ</span>
          <h2 className="lesson-editor-block-title">Настройки тестового урока</h2>
        </div>
      </div>

      <div className="lesson-quiz-settings-grid">
        <label className="lesson-editor-field">
          <span className="lesson-editor-field-title">Баллы за задачу</span>
          <input
            type="number"
            min="1"
            step="1"
            value={points}
            onChange={(event) => setPoints(event.target.value)}
            className="lesson-editor-input"
          />
        </label>

        <div className="lesson-editor-field">
          <span className="lesson-editor-field-title">
            Количество правильных ответов
          </span>
          <div className="lesson-quiz-mode-toggle">
            <button
              type="button"
              className={`lesson-quiz-mode-button${answersMode === "single" ? " is-active" : ""}`}
              onClick={() => handleAnswerModeChange("single")}
            >
              Один
            </button>
            <button
              type="button"
              className={`lesson-quiz-mode-button${answersMode === "multiple" ? " is-active" : ""}`}
              onClick={() => handleAnswerModeChange("multiple")}
            >
              Несколько
            </button>
          </div>
        </div>
      </div>

      <div className="lesson-editor-block-subhead">
        <strong className="lesson-editor-block-subtitle">
          Варианты ответа
        </strong>
        <p className="lesson-editor-block-subtext">
          Добавьте варианты и отметьте правильные. Объяснения после неверного
          ответа пока не показываем.
        </p>
      </div>

      <div className="lesson-quiz-option-list">
        {options.map((option, optionIndex) => (
          <article key={option.id} className="lesson-quiz-option-card">
            <button
              type="button"
              className={`lesson-quiz-option-selector${option.isCorrect ? " is-active" : ""}`}
              onClick={() => toggleCorrectOption(option.id)}
              aria-pressed={option.isCorrect}
            >
              {answersMode === "multiple" ? "☑" : "◉"}
            </button>

            <input
              type="text"
              value={option.text}
              onChange={(event) =>
                updateOption(option.id, {
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
                onClick={() => moveOption(option.id, "up")}
              >
                ↑
              </button>
              <button
                type="button"
                className="lesson-quiz-option-action"
                onClick={() => moveOption(option.id, "down")}
              >
                ↓
              </button>
              <button
                type="button"
                className="lesson-quiz-option-action danger"
                onClick={() => removeOption(option.id)}
              >
                ✕
              </button>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="lesson-editor-primary-action"
        onClick={() =>
          setOptions((currentOptions) => [
            ...currentOptions,
            createQuizOption(`Вариант ${currentOptions.length + 1}`),
          ])
        }
      >
        + Добавить вариант ответа
      </button>
    </section>
  );
}

function LessonEditorWorkspace({ course, activeLesson, activeModule }) {
  const coverInputRef = useRef(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [coverName, setCoverName] = useState("");
  const [titleValue, setTitleValue] = useState(activeLesson?.title || "");

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  function handleCoverSelect(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setCoverPreviewUrl(nextPreviewUrl);
    setCoverName(file.name);
    event.target.value = "";
  }

  const remainingChars = Math.max(0, 64 - titleValue.length);

  return (
    <>
      <header className="lesson-editor-hero">
        <div className="lesson-editor-hero-copy">
          <span className="lesson-editor-kicker">РЕДАКТОР УРОКА</span>
          <h1 className="lesson-editor-title">Настройки урока</h1>
          <p className="lesson-editor-description">
            {course?.title || "Курс"} · {activeModule?.title || "Модуль"} ·{" "}
            {getLessonTypeLabel(activeLesson.type)}
          </p>
        </div>
      </header>

      <section className="lesson-editor-top-card">
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleCoverSelect}
        />

        <button
          type="button"
          className="lesson-editor-cover-trigger"
          onClick={() => coverInputRef.current?.click()}
        >
          {coverPreviewUrl ? (
            <img
              src={coverPreviewUrl}
              alt="Превью обложки урока"
              className="lesson-editor-cover-image"
            />
          ) : (
            <span className="lesson-editor-cover-placeholder">LS</span>
          )}
        </button>

        <div className="lesson-editor-top-fields">
          <div className="lesson-editor-title-row">
            <input
              type="text"
              value={titleValue}
              onChange={(event) => setTitleValue(event.target.value)}
              maxLength="64"
              className="lesson-editor-title-input"
              placeholder="Название урока"
            />
            <span className="lesson-editor-title-counter">
              осталось {remainingChars} символа
            </span>
          </div>

          <button type="button" className="lesson-editor-settings-link">
            Дополнительные настройки
          </button>

          <div className="lesson-editor-top-meta">
            <span>{getLessonTypeLabel(activeLesson.type)}</span>
            <span>{activeLesson.durationLabel}</span>
            {coverName ? <span>{coverName}</span> : null}
          </div>
        </div>
      </section>

      <section className="lesson-editor-block">
        <div className="lesson-editor-block-head">
          <div>
            <span className="lesson-editor-block-kicker">СОДЕРЖАНИЕ</span>
            <h2 className="lesson-editor-block-title">Текст урока</h2>
          </div>
        </div>

        <LessonRichTextEditor lessonTitle={activeLesson.title} />
      </section>

      <LessonAssetsManager />

      {activeLesson.type === "quiz" ? (
        <LessonQuizBuilder />
      ) : null}

      {activeLesson.type === "coding" ? (
        <section className="lesson-editor-block">
          <div className="lesson-editor-empty-panel">
            <strong className="lesson-editor-empty-panel-title">
              Блок для задач с кодом появится позже
            </strong>
            <p className="lesson-editor-empty-panel-text">
              Для кодовых уроков здесь позже подключим отдельный сценарий с
              тестами, языками и автопроверкой. Пока оставляем только общий
              каркас текста и ассетов.
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}

function LessonEditorSection() {
  const {
    course,
    pageStatus,
    pageError,
    reloadCourse,
    activeLesson,
    activeModule,
  } = useOutletContext();

  return (
    <section className="lesson-editor-section">
      {pageStatus === "loading" ? (
        <div className="lesson-editor-empty-state">
          <strong className="lesson-editor-empty-title">
            Загружаем редактор урока
          </strong>
          <p className="lesson-editor-empty-text">
            Подключаем структуру курса и список уроков, чтобы открыть каркас
            редактора.
          </p>
        </div>
      ) : pageStatus === "error" ? (
        <div className="lesson-editor-empty-state">
          <strong className="lesson-editor-empty-title">
            Не удалось открыть редактор урока
          </strong>
          <p className="lesson-editor-empty-text">
            {pageError || "Курс не загрузился для каркаса редактора."}
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
      ) : (
        <LessonEditorWorkspace
          key={activeLesson.id}
          course={course}
          activeLesson={activeLesson}
          activeModule={activeModule}
        />
      )}
    </section>
  );
}

export default LessonEditorSection;
