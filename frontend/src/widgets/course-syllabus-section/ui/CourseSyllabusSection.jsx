import { Link, useOutletContext } from "react-router";

function CourseSyllabusSection() {
  const { modules } = useOutletContext();
  const hasModules = modules.length > 0;
  const lessonsCount = modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  return (
    <section className="course-syllabus-section">
      <header className="course-syllabus-section-head">
        <div className="course-syllabus-section-copy">
          <span className="course-builder-section-kicker">ПРОСМОТР КУРСА</span>
          <h1 className="course-builder-section-title">Содержание курса</h1>
          <p className="course-syllabus-section-description">
            Здесь отображается текущая структура курса: модули и уроки в том
            виде, в котором пользователь будет воспринимать программу.
          </p>
        </div>

        <div className="course-syllabus-section-actions">
          {hasModules ? (
            <div className="course-syllabus-stats">
              <span className="course-syllabus-stat">
                Модулей: {modules.length}
              </span>
              <span className="course-syllabus-stat">Уроков: {lessonsCount}</span>
            </div>
          ) : null}

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
                    Модуль {index + 1}
                  </span>
                  <span className="course-syllabus-module-lessons">
                    Уроков: {module.lessons.length}
                  </span>
                </div>

                <span className="course-syllabus-module-state">Черновик</span>
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
                        Урок {index + 1}.{lessonIndex + 1}
                      </span>
                      <span className="course-syllabus-lesson-title">
                        {lesson.title}
                      </span>
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
            В курсе пока что нет ни одного урока. Добавьте свой первый урок в
            редакторе содержания курса.
          </p>
        </div>
      )}
    </section>
  );
}

export default CourseSyllabusSection;
