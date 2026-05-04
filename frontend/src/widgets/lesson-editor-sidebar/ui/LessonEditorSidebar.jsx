import { Link, useParams } from "react-router";

import {
  CourseDisplayCover,
  LessonStructureCover,
  useLessonCoverMap,
} from "../../../entities/course";

function getLessonTypeLabel(type) {
  if (type === "quiz") {
    return "Тест";
  }

  if (type === "coding") {
    return "Код";
  }

  return "Теория";
}

function LessonEditorSidebar({
  course,
  modules,
  pageStatus,
  activeLessonId,
}) {
  const { courseId } = useParams();
  const lessonCoverById = useLessonCoverMap(modules, {
    enabled: pageStatus === "success",
  });

  return (
    <nav className="lesson-editor-sidebar" aria-label="Содержание курса">
      <div className="lesson-editor-sidebar-summary">
        <CourseDisplayCover
          title={course?.title || "Редактор урока"}
          coverUrl={course?.coverUrl}
          imageUrl={course?.imageUrl}
          variant="sidebar"
        />

        <div className="lesson-editor-sidebar-summary-copy">
          <span className="lesson-editor-sidebar-kicker">УРОК</span>
          <strong className="lesson-editor-sidebar-title">
            {course?.title || "Редактор урока"}
          </strong>
          <p className="lesson-editor-sidebar-text">
            Переключайтесь между уроками курса и наполняйте каждый из них
            отдельно.
          </p>
        </div>
      </div>

      <Link
        to={`/course/${courseId}/syllabus`}
        className="lesson-editor-sidebar-back-link"
      >
        Вернуться к содержанию курса
      </Link>

      <div className="lesson-editor-sidebar-outline">
        <div className="lesson-editor-sidebar-outline-head">
          <strong className="lesson-editor-sidebar-outline-title">
            Содержание курса
          </strong>
          <span className="lesson-editor-sidebar-outline-meta">
            {modules.length} мод.
          </span>
        </div>

        {pageStatus === "loading" ? (
          <p className="lesson-editor-sidebar-empty">
            Загружаем модули и уроки курса.
          </p>
        ) : modules.length ? (
          <div className="lesson-editor-sidebar-module-list">
            {modules.map((module, moduleIndex) => (
              <section
                key={module.id}
                className="lesson-editor-sidebar-module-card"
              >
                <div className="lesson-editor-sidebar-module-head">
                  <span className="lesson-editor-sidebar-module-index">
                    Модуль {module.position ?? moduleIndex + 1}
                  </span>
                  <strong className="lesson-editor-sidebar-module-title">
                    {module.title}
                  </strong>
                </div>

                {module.lessons.length ? (
                  <div className="lesson-editor-sidebar-lesson-list">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isActive = lesson.id === activeLessonId;

                      return (
                        <Link
                          key={lesson.id}
                          to={`/course/${courseId}/edit-lesson/${lesson.id}`}
                          className={`lesson-editor-sidebar-lesson-link${isActive ? " is-active" : ""}`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <span className="lesson-editor-sidebar-lesson-order">
                            {module.position ?? moduleIndex + 1}.
                            {lesson.position ?? lessonIndex + 1}
                          </span>

                          <LessonStructureCover
                            title={lesson.title}
                            coverUrl={lessonCoverById[lesson.id] || ""}
                            size="tiny"
                          />

                          <span className="lesson-editor-sidebar-lesson-copy">
                            <span className="lesson-editor-sidebar-lesson-title">
                              {lesson.title}
                            </span>
                            <span className="lesson-editor-sidebar-lesson-type">
                              {getLessonTypeLabel(lesson.type)}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="lesson-editor-sidebar-empty">
                    В модуле пока нет уроков.
                  </p>
                )}
              </section>
            ))}
          </div>
        ) : (
          <p className="lesson-editor-sidebar-empty">
            В курсе пока нет уроков для редактирования.
          </p>
        )}
      </div>
    </nav>
  );
}

export default LessonEditorSidebar;
