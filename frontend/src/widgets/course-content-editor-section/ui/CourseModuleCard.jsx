import { LessonStructureCover } from "../../../entities/course";
import { getLessonTypeLabel } from "../model/courseContentEditorModel";

function CourseModuleCard({
  index,
  isCreatingLesson,
  lessonCoverById,
  lessonDraft,
  lessonError,
  module,
  onCreateLesson,
  onLessonDraftChange,
  viewerName,
}) {
  return (
    <article className="course-editor-module-card">
      <div className="course-editor-module-head">
        <div className="course-editor-module-badge">
          <span className="course-editor-module-index">
            {module.position ?? index + 1}
          </span>
          <span className="course-editor-module-badge-copy">Модуль</span>
        </div>

        <div className="course-editor-module-fields course-editor-module-fields-readonly">
          <strong className="course-editor-module-title-text">
            {module.title}
          </strong>
          <p className="course-editor-module-description-text">
            {module.description || "Описание модуля пока не указано."}
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
                    {lesson.isPreview ? "Превью-доступ" : "Обычный урок"}
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
              onLessonDraftChange(module.id, {
                title: event.target.value,
              })
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onCreateLesson(module);
              }
            }}
            placeholder="Введите название нового урока и нажмите Enter."
            className="course-editor-lesson-input"
          />

          <div className="course-editor-lesson-composer-bottom">
            <div className="course-editor-lesson-form">
              <div className="course-editor-lesson-config">
                <label className="course-editor-field-stack">
                  <span className="course-editor-field-label">Тип</span>
                  <select
                    value={lessonDraft.type}
                    onChange={(event) =>
                      onLessonDraftChange(module.id, {
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
                  <span className="course-editor-field-label">Минуты</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={lessonDraft.estimatedMinutes}
                    onChange={(event) =>
                      onLessonDraftChange(module.id, {
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
                      onLessonDraftChange(module.id, {
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
              onClick={() => onCreateLesson(module)}
            >
              {isCreatingLesson ? "Создаём урок..." : "Создать урок"}
            </button>
          </div>

          <span className="course-editor-lesson-author">
            Автор: {viewerName || "текущий преподаватель"}
          </span>
        </div>

        {lessonError ? (
          <p className="course-inline-feedback error">{lessonError}</p>
        ) : null}
      </div>
    </article>
  );
}

export default CourseModuleCard;
