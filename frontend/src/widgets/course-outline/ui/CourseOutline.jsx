import { Link } from "react-router";

import { useLessonCoverMap } from "../../../entities/course/model/useLessonCoverMap";
import LessonStructureCover from "../../../entities/course/ui/LessonStructureCover";

function CourseOutline({
  course,
  syllabus,
  currentLessonId,
  completedLessonIds = [],
  completedLessonsCount = 0,
  courseProgressPercent = 0,
  lessonProgressByLessonId = {},
  showLessonProgress = false,
}) {
  const modules = syllabus?.modules ?? [];
  const lessonCoverById = useLessonCoverMap(modules);

  return (
    <aside className="course-outline">
      <section className="course-outline-card">
        <div className="course-outline-head">
          <p className="course-outline-course-title">{course.title}</p>
          <p className="course-outline-progress">
            Прогресс по курсу: {completedLessonsCount}/{course.lessonsCount}
          </p>

          <div className="course-outline-progressbar">
            <div
              className="course-outline-progressbar-fill"
              style={{ width: `${courseProgressPercent}%` }}
            />
          </div>

          <Link
            to={`/courses/${course.id}?tab=content`}
            className="course-inline-btn"
          >
            Вернуться к содержанию
          </Link>
        </div>

        <div className="course-outline-modules">
          {modules.map((module, moduleIndex) => (
            <section key={module.id} className="course-outline-module">
              <div className="course-outline-module-head">
                <h2 className="course-outline-module-title">
                  {moduleIndex + 1} {module.title}
                </h2>
              </div>

              <div className="course-outline-lessons">
                {module.lessons.map((lesson, lessonIndex) => {
                  const isCurrentLesson = lesson.lessonId === currentLessonId;
                  const isCompletedLesson = completedLessonIds.includes(
                    lesson.lessonId,
                  );
                  const lessonProgress =
                    showLessonProgress && lesson.lessonId
                      ? lessonProgressByLessonId[lesson.lessonId] ?? null
                      : null;
                  const progressTooltip =
                    showLessonProgress && lessonProgress?.isCompleted
                      ? "Урок пройден"
                      : showLessonProgress && lessonProgress?.isStarted
                        ? "Урок начат"
                      : undefined;

                  if (lesson.lessonId) {
                    return (
                      <Link
                        key={lesson.id}
                        to={`/courses/${course.id}/lessons/${lesson.lessonId}`}
                        className={`course-outline-lesson ${
                          isCurrentLesson ? "active" : ""
                        } ${isCompletedLesson ? "completed" : ""}`}
                      >
                        <span className="course-outline-lesson-index">
                          {moduleIndex + 1}.{lessonIndex + 1}
                        </span>
                        <LessonStructureCover
                          title={lesson.title}
                          coverUrl={
                            lessonCoverById[lesson.lessonId || lesson.id] || ""
                          }
                          size="tiny"
                        />
                        <div className="course-outline-lesson-body">
                          <span
                            className="course-outline-lesson-title"
                          >
                            {lesson.title}
                          </span>
                        </div>
                        {progressTooltip ? (
                          <span className="course-outline-lesson-hover-progress">
                            {progressTooltip}
                          </span>
                        ) : null}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={lesson.id}
                      className="course-outline-lesson disabled"
                    >
                      <span className="course-outline-lesson-index">
                        {moduleIndex + 1}.{lessonIndex + 1}
                      </span>
                      <LessonStructureCover
                        title={lesson.title}
                        coverUrl={
                          lessonCoverById[lesson.lessonId || lesson.id] || ""
                        }
                        size="tiny"
                      />
                      <div className="course-outline-lesson-body">
                        <span className="course-outline-lesson-title">
                          {lesson.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default CourseOutline;
