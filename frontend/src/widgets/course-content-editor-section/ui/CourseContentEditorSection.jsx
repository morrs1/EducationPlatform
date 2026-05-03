import { useState } from "react";
import { Link, useOutletContext } from "react-router";

import {
  LessonStructureCover,
  useLessonCoverMap,
} from "../../../entities/course";

const initialModuleDraft = {
  title: "",
  description: "",
  estimatedMinutes: "0",
};

function createInitialLessonDraft() {
  return {
    title: "",
    type: "theory",
    estimatedMinutes: "0",
    isPreview: false,
  };
}

function getLessonTypeLabel(type) {
  if (type === "quiz") {
    return "Тест";
  }

  if (type === "coding") {
    return "Код";
  }

  return "Теория";
}

function CourseContentEditorSection() {
  const {
    course,
    modules,
    pageStatus,
    pageError,
    viewerName,
    reloadCourse,
    createModule,
    createLesson,
  } = useOutletContext();
  const [moduleDraft, setModuleDraft] = useState(initialModuleDraft);
  const [moduleError, setModuleError] = useState("");
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [lessonDraftsByModuleId, setLessonDraftsByModuleId] = useState({});
  const [lessonErrorsByModuleId, setLessonErrorsByModuleId] = useState({});
  const [creatingLessonModuleId, setCreatingLessonModuleId] = useState(null);
  const hasModules = modules.length > 0;
  const lessonsCount = modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );
  const lessonCoverById = useLessonCoverMap(modules, {
    enabled: pageStatus === "success",
  });

  function updateLessonDraft(moduleId, patch) {
    setLessonDraftsByModuleId((currentDrafts) => ({
      ...currentDrafts,
      [moduleId]: {
        ...createInitialLessonDraft(),
        ...currentDrafts[moduleId],
        ...patch,
      },
    }));
  }

  function getLessonDraft(moduleId) {
    return lessonDraftsByModuleId[moduleId] ?? createInitialLessonDraft();
  }

  async function handleModuleCreate() {
    const nextTitle = moduleDraft.title.trim();
    const nextDescription = moduleDraft.description.trim();

    if (!nextTitle) {
      setModuleError("Введите название нового модуля.");
      return;
    }

    if (!nextDescription) {
      setModuleError("Добавьте описание модуля.");
      return;
    }

    setIsCreatingModule(true);
    setModuleError("");

    const result = await createModule({
      title: nextTitle,
      description: nextDescription,
      position: modules.length + 1,
      estimatedMinutes: Math.max(
        0,
        Number.parseInt(moduleDraft.estimatedMinutes, 10) || 0,
      ),
    });

    setIsCreatingModule(false);

    if (!result.ok) {
      setModuleError(result.error || "Не удалось создать модуль.");
      return;
    }

    setModuleDraft(initialModuleDraft);
  }

  async function handleLessonCreate(module) {
    const lessonDraft = getLessonDraft(module.id);
    const nextTitle = lessonDraft.title.trim();

    if (!nextTitle) {
      setLessonErrorsByModuleId((currentErrors) => ({
        ...currentErrors,
        [module.id]: "Введите название урока.",
      }));
      return;
    }

    setCreatingLessonModuleId(module.id);
    setLessonErrorsByModuleId((currentErrors) => ({
      ...currentErrors,
      [module.id]: "",
    }));

    const result = await createLesson({
      moduleId: module.id,
      title: nextTitle,
      type: lessonDraft.type,
      position: module.lessons.length + 1,
      estimatedMinutes: Math.max(
        0,
        Number.parseInt(lessonDraft.estimatedMinutes, 10) || 0,
      ),
      isPreview: Boolean(lessonDraft.isPreview),
    });

    setCreatingLessonModuleId(null);

    if (!result.ok) {
      setLessonErrorsByModuleId((currentErrors) => ({
        ...currentErrors,
        [module.id]: result.error || "Не удалось создать урок.",
      }));
      return;
    }

    setLessonDraftsByModuleId((currentDrafts) => ({
      ...currentDrafts,
      [module.id]: createInitialLessonDraft(),
    }));
  }

  function renderModuleComposer() {
    return (
      <article className="course-editor-module-card course-editor-module-card-dashed">
        <div className="course-editor-module-head">
          <div className="course-editor-module-badge">
            <span className="course-editor-module-index">+</span>
            <span className="course-editor-module-badge-copy">Модуль</span>
          </div>

          <div className="course-editor-module-fields">
            <input
              type="text"
              value={moduleDraft.title}
              onChange={(event) =>
                setModuleDraft((currentDraft) => ({
                  ...currentDraft,
                  title: event.target.value,
                }))
              }
              placeholder="Название нового модуля"
              className="course-editor-module-title-input"
            />

            <input
              type="text"
              value={moduleDraft.description}
              onChange={(event) =>
                setModuleDraft((currentDraft) => ({
                  ...currentDraft,
                  description: event.target.value,
                }))
              }
              placeholder="Короткое описание модуля"
              className="course-editor-module-description-input"
            />
          </div>

          <div className="course-editor-module-controls">
            <label className="course-editor-field-stack">
              <span className="course-editor-field-label">Минуты</span>
              <input
                type="number"
                min="0"
                step="1"
                value={moduleDraft.estimatedMinutes}
                onChange={(event) =>
                  setModuleDraft((currentDraft) => ({
                    ...currentDraft,
                    estimatedMinutes: event.target.value,
                  }))
                }
                className="course-editor-compact-input"
              />
            </label>

            <button
              type="button"
              className="course-editor-primary-action"
              disabled={isCreatingModule}
              onClick={handleModuleCreate}
            >
              {isCreatingModule ? "Создаём модуль..." : "+ Новый модуль"}
            </button>
          </div>
        </div>

        {moduleError ? (
          <p className="course-inline-feedback error">{moduleError}</p>
        ) : null}
      </article>
    );
  }

  if (pageStatus === "loading") {
    return (
      <section className="course-editor-section">
        <div className="course-editor-empty-state">
          <strong className="course-editor-empty-title">
            Загружаем редактор курса
          </strong>
          <p className="course-editor-empty-body">
            Подключаем текущую структуру модулей и уроков из `course_service`.
          </p>
        </div>
      </section>
    );
  }

  if (pageStatus === "error") {
    return (
      <section className="course-editor-section">
        <div className="course-editor-empty-state">
          <strong className="course-editor-empty-title">
            Не удалось открыть редактор
          </strong>
          <p className="course-editor-empty-body">
            {pageError ||
              "course_service не вернул данные по содержанию курса."}
          </p>
          <button
            type="button"
            className="course-editor-primary-action"
            onClick={reloadCourse}
          >
            Повторить запрос
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="course-editor-section">
      <header className="course-editor-section-head">
        <div className="course-editor-section-copy">
          <span className="course-builder-section-kicker">
            РЕДАКТОР ПРОГРАММЫ
          </span>
          <h1 className="course-builder-section-title">
            {course?.title || "Соберите модули и уроки"}
          </h1>
          <p className="course-editor-empty-copy">
            Сначала собирайте модули, затем добавляйте в них уроки.
          </p>
        </div>

        <div className="course-editor-section-stats">
          <span className="course-editor-stat">Модулей: {modules.length}</span>
          <span className="course-editor-stat">Уроков: {lessonsCount}</span>
        </div>
      </header>

      {!hasModules ? (
        <div className="course-editor-empty-state">
          <strong className="course-editor-empty-title">
            Начните с первого модуля
          </strong>
          <p className="course-editor-empty-body">
            Курс уже создан. Теперь можно добавить первый модуль и сразу начать
            наполнять его уроками.
          </p>
        </div>
      ) : null}

      <div className="course-editor-modules">
        {hasModules
          ? modules.map((module, index) => {
              const lessonDraft = getLessonDraft(module.id);
              const lessonError = lessonErrorsByModuleId[module.id];
              const isCreatingLesson = creatingLessonModuleId === module.id;

              return (
                <article key={module.id} className="course-editor-module-card">
                  <div className="course-editor-module-head">
                    <div className="course-editor-module-badge">
                      <span className="course-editor-module-index">
                        {module.position ?? index + 1}
                      </span>
                      <span className="course-editor-module-badge-copy">
                        Модуль
                      </span>
                    </div>

                    <div className="course-editor-module-fields course-editor-module-fields-readonly">
                      <strong className="course-editor-module-title-text">
                        {module.title}
                      </strong>
                      <p className="course-editor-module-description-text">
                        {module.description ||
                          "Описание модуля пока не указано."}
                      </p>
                    </div>

                    <div className="course-editor-module-controls">
                      <span className="course-editor-module-meta">
                        Уроков: {module.lessons.length}
                      </span>
                      <span className="course-editor-module-meta">
                        {module.durationLabel}
                      </span>
                    </div>
                  </div>

                  {module.lessons.length ? (
                    <div className="course-editor-lesson-list-wrap">
                      <div className="course-editor-lesson-list-head">
                        <strong className="course-editor-lesson-list-title">
                          Уроки модуля
                        </strong>
                        <span className="course-editor-lesson-list-count">
                          {module.lessons.length}
                        </span>
                      </div>

                      <div className="course-editor-lesson-list">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <article
                            key={lesson.id}
                            className="course-editor-existing-lesson-card"
                          >
                            <div className="course-editor-existing-lesson-media">
                              <LessonStructureCover
                                title={lesson.title}
                                coverUrl={lessonCoverById[lesson.id] || ""}
                                size="compact"
                              />

                              <div
                                className="course-editor-existing-lesson-type"
                                aria-hidden="true"
                              >
                                {getLessonTypeLabel(lesson.type)}
                              </div>
                            </div>

                            <div className="course-editor-existing-lesson-copy">
                              <div className="course-editor-existing-lesson-head">
                                <span className="course-editor-existing-lesson-index">
                                  {module.position ?? index + 1}.
                                  {lesson.position ?? lessonIndex + 1}
                                </span>
                                <strong className="course-editor-existing-lesson-title">
                                  {lesson.title}
                                </strong>
                              </div>

                              <span className="course-editor-existing-lesson-meta">
                                {lesson.durationLabel} ·{" "}
                                {lesson.isPreview
                                  ? "Превью-доступ"
                                  : "Обычный урок"}
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="course-editor-lesson-composer-wrap">
                    <div className="course-editor-lesson-composer-head">
                      <strong className="course-editor-lesson-composer-title">
                        Добавить новый урок
                      </strong>
                      <span className="course-editor-lesson-composer-note">
                        Новый урок сразу появится в структуре этого модуля
                      </span>
                    </div>

                    <div className="course-editor-lesson-composer">
                      <input
                        type="text"
                        value={lessonDraft.title}
                        onChange={(event) =>
                          updateLessonDraft(module.id, {
                            title: event.target.value,
                          })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleLessonCreate(module);
                          }
                        }}
                        placeholder="Введите название нового урока и нажмите Enter."
                        className="course-editor-lesson-input"
                      />

                      <div className="course-editor-lesson-composer-bottom">
                        <div className="course-editor-lesson-form">
                          <div className="course-editor-lesson-config">
                            <label className="course-editor-field-stack">
                              <span className="course-editor-field-label">
                                Тип
                              </span>
                              <select
                                value={lessonDraft.type}
                                onChange={(event) =>
                                  updateLessonDraft(module.id, {
                                    type: event.target.value,
                                  })
                                }
                                className="course-editor-compact-input"
                              >
                                <option value="theory">Теория</option>
                                <option value="quiz">Тест</option>
                                <option value="coding">Код</option>
                              </select>
                            </label>

                            <label className="course-editor-field-stack">
                              <span className="course-editor-field-label">
                                Минуты
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={lessonDraft.estimatedMinutes}
                                onChange={(event) =>
                                  updateLessonDraft(module.id, {
                                    estimatedMinutes: event.target.value,
                                  })
                                }
                                className="course-editor-compact-input"
                              />
                            </label>

                            <label className="course-editor-checkbox">
                              <input
                                type="checkbox"
                                checked={lessonDraft.isPreview}
                                onChange={(event) =>
                                  updateLessonDraft(module.id, {
                                    isPreview: event.target.checked,
                                  })
                                }
                              />
                              <span>Превью-урок</span>
                            </label>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="course-editor-lesson-submit"
                          disabled={isCreatingLesson}
                          onClick={() => handleLessonCreate(module)}
                        >
                          {isCreatingLesson
                            ? "Создаём урок..."
                            : "Создать урок"}
                        </button>
                      </div>

                      <span className="course-editor-lesson-author">
                        Автор: {viewerName || "текущий преподаватель"}
                      </span>
                    </div>

                    {lessonError ? (
                      <p className="course-inline-feedback error">
                        {lessonError}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })
          : null}

        {renderModuleComposer()}
      </div>

      <footer className="course-editor-footer">
        <button
          type="button"
          className="course-editor-save-btn"
          onClick={reloadCourse}
        >
          Обновить структуру
        </button>

        <Link to="../syllabus" className="course-editor-return-link">
          Вернуться к просмотру
        </Link>
      </footer>
    </section>
  );
}

export default CourseContentEditorSection;
