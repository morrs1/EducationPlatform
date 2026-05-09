import { useState } from "react";
import { Link, useOutletContext } from "react-router";

import { useLessonCoverMap } from "../../../entities/course";
import {
  buildLessonPayload,
  buildModulePayload,
  createInitialLessonDraft,
  initialModuleDraft,
} from "../model/courseContentEditorModel";
import CourseModuleCard from "./CourseModuleCard";
import CourseModuleComposer from "./CourseModuleComposer";

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
    const { error, payload } = buildModulePayload(
      moduleDraft,
      modules.length + 1,
    );

    if (error) {
      setModuleError(error);
      return;
    }

    setIsCreatingModule(true);
    setModuleError("");

    const result = await createModule(payload);

    setIsCreatingModule(false);

    if (!result.ok) {
      setModuleError(result.error || "Не удалось создать модуль.");
      return;
    }

    setModuleDraft(initialModuleDraft);
  }

  async function handleLessonCreate(module) {
    const lessonDraft = getLessonDraft(module.id);
    const { error, payload } = buildLessonPayload(lessonDraft, module);

    if (error) {
      setLessonErrorsByModuleId((currentErrors) => ({
        ...currentErrors,
        [module.id]: error,
      }));
      return;
    }

    setCreatingLessonModuleId(module.id);
    setLessonErrorsByModuleId((currentErrors) => ({
      ...currentErrors,
      [module.id]: "",
    }));

    const result = await createLesson(payload);

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


  if (pageStatus === "loading") {
    return (
      <section className="course-editor-section">
        <div className="course-editor-empty-state">
          <strong className="course-editor-empty-title">
            Загружаем редактор курса
          </strong>
          <p className="course-editor-empty-body">
            Подготавливаем модули и уроки для редактирования.
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
              "Не удалось получить содержание курса."}
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
          ? modules.map((module, index) => (
              <CourseModuleCard
                key={module.id}
                index={index}
                isCreatingLesson={creatingLessonModuleId === module.id}
                lessonCoverById={lessonCoverById}
                lessonDraft={getLessonDraft(module.id)}
                lessonError={lessonErrorsByModuleId[module.id]}
                module={module}
                onCreateLesson={handleLessonCreate}
                onLessonDraftChange={updateLessonDraft}
                viewerName={viewerName}
              />
            ))
          : null}

        <CourseModuleComposer
          draft={moduleDraft}
          error={moduleError}
          isCreating={isCreatingModule}
          onChange={(patch) =>
            setModuleDraft((currentDraft) => ({
              ...currentDraft,
              ...patch,
            }))
          }
          onCreate={handleModuleCreate}
        />
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
