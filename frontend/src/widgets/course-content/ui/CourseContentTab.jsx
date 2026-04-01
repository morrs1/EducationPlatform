function CourseContentTab({
  course,
  syllabus,
  isLogged,
  canViewContent,
  onLogin,
  onEnroll,
}) {
  if (!isLogged) {
    return (
      <section className="course-panel">
        <div className="course-gate">
          <h2 className="course-gate-title">Содержание закрыто для гостей</h2>
          <p className="course-gate-text">
            Описание и отзывы уже доступны, а подробная программа курса
            откроется после входа в аккаунт и записи на обучение.
          </p>
          <button type="button" className="course-inline-btn" onClick={onLogin}>
            Войти
          </button>
        </div>
      </section>
    );
  }

  if (!canViewContent) {
    return (
      <section className="course-panel">
        <div className="course-gate">
          <h2 className="course-gate-title">Содержание откроется после записи</h2>
          <p className="course-gate-text">
            Курс «{course.title}» уже можно изучить по описанию и отзывам.
            Чтобы увидеть полную программу с уроками и модулями, запишитесь на
            курс.
          </p>
          <button type="button" className="course-inline-btn" onClick={onEnroll}>
            Записаться на курс
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="course-panel">
      <div className="course-panel-header">
        <div>
          <p className="course-panel-label">Программа обучения</p>
          <h2 className="course-panel-title">Содержание курса</h2>
        </div>

        <p className="course-panel-description">
          {syllabus.modules.length} модулей, {course.lessonsCount} уроков и
          практический ритм без перегруза.
        </p>
      </div>

      <div className="course-syllabus">
        {syllabus.modules.map((module, index) => (
          <article key={module.id} className="course-module-card">
            <div className="course-module-head">
              <div>
                <p className="course-module-index">Модуль {index + 1}</p>
                <h3 className="course-module-title">{module.title}</h3>
              </div>

              <span className="course-module-summary-count">
                {module.lessons.length} уроков
              </span>
            </div>

            <p className="course-module-summary">{module.summary}</p>

            <div className="course-lessons-list">
              {module.lessons.map((lesson, lessonIndex) => (
                <div key={lesson.id} className="course-lesson-row">
                  <div className="course-lesson-meta">
                    <span className="course-lesson-index">
                      {index + 1}.{lessonIndex + 1}
                    </span>
                    <span className="course-lesson-title">{lesson.title}</span>
                  </div>

                  <span className="course-lesson-duration">
                    {lesson.durationLabel}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CourseContentTab;
