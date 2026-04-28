import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router";

import {
  extractLessonCoverAssetFromLessonResponse,
  requestLessonById,
} from "../../../entities/course/model/courseServiceApi";

function getLessonTypeLabel(type) {
  if (type === "quiz") {
    return "Тест";
  }

  if (type === "coding") {
    return "Код";
  }

  return "Теория";
}

function getUniqueLessonIds(modules) {
  return Array.from(
    new Set(
      modules.flatMap((module) =>
        module.lessons.map((lesson) => lesson.id || lesson.lessonId).filter(Boolean),
      ),
    ),
  );
}

function LessonSyllabusCover({ title, coverUrl }) {
  if (coverUrl) {
    return (
      <div className="course-syllabus-lesson-cover">
        <img
          src={coverUrl}
          alt={`Обложка урока ${title || ""}`.trim()}
          className="course-syllabus-lesson-cover-image"
        />
      </div>
    );
  }

  return (
    <div className="course-syllabus-lesson-cover">
      <div className="course-syllabus-lesson-cover-fallback" aria-hidden="true">
        <span className="course-syllabus-lesson-cover-mark">EP</span>
      </div>
    </div>
  );
}

function CourseSyllabusSection() {
  const { course, modules, pageStatus, pageError, reloadCourse } =
    useOutletContext();
  const [lessonCoverById, setLessonCoverById] = useState({});
  const hasModules = modules.length > 0;
  const lessonsCount = modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );
  const lessonIds = useMemo(() => getUniqueLessonIds(modules), [modules]);

  useEffect(() => {
    let isCancelled = false;

    if (pageStatus !== "success" || !lessonIds.length) {
      return () => {
        isCancelled = true;
      };
    }

    async function loadLessonCovers() {
      const entries = await Promise.all(
        lessonIds.map(async (lessonId) => {
          try {
            const lessonResponse = await requestLessonById(lessonId);
            const coverAsset =
              extractLessonCoverAssetFromLessonResponse(lessonResponse);

            return [lessonId, coverAsset?.url || ""];
          } catch {
            return [lessonId, ""];
          }
        }),
      );

      if (!isCancelled) {
        setLessonCoverById(Object.fromEntries(entries));
      }
    }

    loadLessonCovers();

    return () => {
      isCancelled = true;
    };
  }, [lessonIds, pageStatus]);

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
                      <LessonSyllabusCover
                        title={lesson.title}
                        coverUrl={lessonCoverById[lesson.id || lesson.lessonId] || ""}
                      />

                      <div className="course-syllabus-lesson-copy">
                        <div className="course-syllabus-lesson-copy-head">
                          <span className="course-syllabus-lesson-badge">
                            {module.position ?? index + 1}.
                            {lesson.position ?? lessonIndex + 1}
                          </span>
                        </div>
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
