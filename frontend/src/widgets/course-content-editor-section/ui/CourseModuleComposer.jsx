function CourseModuleComposer({
  draft,
  error,
  isCreating,
  onChange,
  onCreate,
}) {
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
            value={draft.title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="Название нового модуля"
            className="course-editor-module-title-input"
          />

          <input
            type="text"
            value={draft.description}
            onChange={(event) => onChange({ description: event.target.value })}
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
              value={draft.estimatedMinutes}
              onChange={(event) =>
                onChange({ estimatedMinutes: event.target.value })
              }
              className="course-editor-compact-input"
            />
          </label>

          <button
            type="button"
            className="course-editor-primary-action"
            disabled={isCreating}
            onClick={onCreate}
          >
            {isCreating ? "Создаём модуль..." : "+ Новый модуль"}
          </button>
        </div>
      </div>

      {error ? <p className="course-inline-feedback error">{error}</p> : null}
    </article>
  );
}

export default CourseModuleComposer;
