import { Link, useOutletContext } from "react-router";

function getLessonTypeLabel(type) {
  if (type === "quiz") {
    return "Тест";
  }

  if (type === "coding") {
    return "Код";
  }

  return "Теория";
}

function CourseSyllabusSection() {
  const { course, modules, pageStatus, pageError, reloadCourse } =
    useOutletContext();
  const hasModules = modules.length > 0;
  const lessonsCount = modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  if (pageStatus === "loading") {
    return (
      <section className="course-syllabus-section">
        <div className="course-syllabus-empty-state">
          <strong className="course-syllabus-empty-title">
            Загружаем содержание курса
          </strong>
          <p className="course-syllabus-empty-text">
            Подключаем `course_service` и собираем актуальную структуру модулей.
          </p>
        </div>
      </section>
    );
  }

  if (pageStatus === "error") {
    return (
      <section className="course-syllabus-section">
        <div className="course-syllabus-empty-state">
          <strong className="course-syllabus-empty-title">
            Не удалось загрузить структуру курса
          </strong>
          <p className="course-syllabus-empty-text">
            {pageError || "course_service не вернул данные по содержанию."}
          </p>
          <button
            type="button"
            className="course-syllabus-edit-link"
            onClick={reloadCourse}
          >
            Повторить запрос
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="course-syllabus-section">
      <header className="course-syllabus-section-head">
        <div className="course-syllabus-section-copy">
          <span className="course-builder-section-kicker">ПРОСМОТР КУРСА</span>
          <h1 className="course-builder-section-title">
            {course?.title || "Содержание курса"}
          </h1>
          <p className="course-syllabus-section-description">
            Здесь отображается текущая структура курса: модули, типы уроков,
            длительность и доступность превью. Это тот вид, который удобно
            использовать для быстрой проверки программы.
          </p>
        </div>

        <div className="course-syllabus-section-actions">
          <div className="course-syllabus-stats">
            <span className="course-syllabus-stat">Модулей: {modules.length}</span>
            <span className="course-syllabus-stat">Уроков: {lessonsCount}</span>
          </div>

          <Link to="../edit" className="course-syllabus-edit-link">
            Редактировать содержание
          </Link>
        </div>
      </header>

      {hasModules ? (
        <div className="course-syllabus-module-list">
          {modules.map((module, index) => (
            <article key={module.id} className="course-syllabus-module-card">
              <div className="course-syllabus-module-head">
                <div className="course-syllabus-module-meta">
                  <span className="course-syllabus-module-index">
                    Модуль {module.position ?? index + 1}
                  </span>
                  <span className="course-syllabus-module-lessons">
                    Уроков: {module.lessons.length}
                  </span>
                  <span className="course-syllabus-module-lessons">
                    {module.durationLabel}
                  </span>
                </div>

                <span className="course-syllabus-module-state">
                  Сохранён в backend
                </span>
              </div>

              <h2 className="course-syllabus-module-title">{module.title}</h2>

              {module.description.trim() ? (
                <p className="course-syllabus-module-description">
                  {module.description}
                </p>
              ) : null}

              {module.lessons.length ? (
                <div className="course-syllabus-lesson-list">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className="course-syllabus-lesson-item"
                    >
                      <span className="course-syllabus-lesson-badge">
                        {module.position ?? index + 1}.{lesson.position ?? lessonIndex + 1}
                      </span>

                      <div className="course-syllabus-lesson-copy">
                        <span className="course-syllabus-lesson-title">
                          {lesson.title}
                        </span>
                        <span className="course-syllabus-lesson-meta">
                          {getLessonTypeLabel(lesson.type)} · {lesson.durationLabel}
                          {lesson.isPreview ? " · Превью" : ""}
                        </span>
                      </div>

                      <div className="course-syllabus-lesson-edit-slot">
                        <Link
                          to={`../edit-lesson/${lesson.id}`}
                          className="course-syllabus-lesson-edit-link-inline"
                        >
                          Редактировать
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="course-syllabus-module-empty-lessons">
                  В этом модуле пока нет уроков.
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="course-syllabus-empty-state">
          <strong className="course-syllabus-empty-title">
            Содержание пока не заполнено
          </strong>
          <p className="course-syllabus-empty-text">
            Курс уже создан, но в нём ещё нет модулей и уроков. Перейдите в
            редактор и добавьте первый модуль.
          </p>
        </div>
      )}
    </section>
  );
}

export default CourseSyllabusSection;
