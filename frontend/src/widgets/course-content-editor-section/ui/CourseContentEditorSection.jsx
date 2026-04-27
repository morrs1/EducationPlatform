import { Link, useOutletContext } from "react-router";

function CourseContentEditorSection() {
  const { modules, addModule, updateModuleField, addLesson } = useOutletContext();
  const hasModules = modules.length > 0;
  const lessonsCount = modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  return (
    <section className="course-editor-section">
      <header className="course-editor-section-head">
        <div className="course-editor-section-copy">
          <span className="course-builder-section-kicker">РЕДАКТОР ПРОГРАММЫ</span>
          <h1 className="course-builder-section-title">Соберите модули и уроки</h1>
          <p className="course-editor-empty-copy">
            Сначала создайте модуль, затем добавляйте в него уроки. Вся текущая
            структура сразу попадёт в режим просмотра содержания.
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
            После создания модуля можно будет сразу добавлять в него уроки и
            смотреть, как структура выглядит в режиме `syllabus`.
          </p>

          <button
            type="button"
            className="course-editor-primary-action"
            onClick={addModule}
          >
            + Новый модуль
          </button>
        </div>
      ) : null}

      {hasModules ? (
        <div className="course-editor-modules">
          {modules.map((module, index) => (
            <article key={module.id} className="course-editor-module-card">
              <div className="course-editor-module-head">
                <div className="course-editor-module-badge">
                  <span className="course-editor-module-index">{index + 1}</span>
                  <span className="course-editor-module-badge-copy">Модуль</span>
                </div>

                <div className="course-editor-module-fields">
                  <input
                    type="text"
                    value={module.title}
                    onChange={(event) =>
                      updateModuleField(module.id, "title", event.target.value)
                    }
                    className="course-editor-module-title-input"
                  />

                  <input
                    type="text"
                    value={module.description}
                    onChange={(event) =>
                      updateModuleField(
                        module.id,
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="Дополнительное описание"
                    className="course-editor-module-description-input"
                  />
                </div>

                <span className="course-editor-module-meta">
                  Уроков в модуле: {module.lessons.length}
                </span>
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
                      <div
                        className="course-editor-existing-lesson-avatar"
                        aria-hidden="true"
                      >
                        EP
                      </div>

                      <div className="course-editor-existing-lesson-copy">
                        <div className="course-editor-existing-lesson-head">
                          <span className="course-editor-existing-lesson-index">
                            {index + 1}.{lessonIndex + 1}
                          </span>
                          <strong className="course-editor-existing-lesson-title">
                            {lesson.title}
                          </strong>
                        </div>

                        <span className="course-editor-existing-lesson-meta">
                          Саркисян Баграт · Урок не сохранен
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
                    Нажмите `Enter` или кнопку справа
                  </span>
                </div>

                <div className="course-editor-lesson-composer">
                  <div className="course-editor-lesson-form">
                    <input
                      type="text"
                      value={module.draftLessonTitle}
                      onChange={(event) =>
                        updateModuleField(
                          module.id,
                          "draftLessonTitle",
                          event.target.value,
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addLesson(module.id);
                        }
                      }}
                      placeholder="Введите название нового урока и нажмите Enter."
                      className="course-editor-lesson-input"
                    />

                    <span className="course-editor-lesson-author">
                      Саркисян Баграт
                    </span>
                  </div>

                  <button
                    type="button"
                    className="course-editor-lesson-submit"
                    onClick={() => addLesson(module.id)}
                  >
                    Создать урок
                  </button>
                </div>
              </div>
            </article>
          ))}

          <button
            type="button"
            className="course-editor-primary-action"
            onClick={addModule}
          >
            + Новый модуль
          </button>
        </div>
      ) : null}

      <footer className="course-editor-footer">
        <span className="course-editor-footer-note">
          Изменения пока сохраняются только в локальном каркасе интерфейса.
        </span>

        <button type="button" className="course-editor-save-btn">
          Сохранить
        </button>

        <Link to="../syllabus" className="course-editor-return-link">
          Вернуться к просмотру
        </Link>
      </footer>
    </section>
  );
}

export default CourseContentEditorSection;
