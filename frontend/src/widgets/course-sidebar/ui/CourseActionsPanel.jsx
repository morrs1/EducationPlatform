function CourseActionsPanel({
  course,
  isLogged,
  onPrimaryAction,
}) {
  const isReadOnlyCourse = course.isReadOnlyCourse;
  const isLearningAvailable = course.isEnrolled || course.isCompleted;
  const primaryButtonLabel = isReadOnlyCourse
    ? "Открыть содержание"
    : !isLogged
      ? "Войти, чтобы записаться"
      : isLearningAvailable
        ? "Перейти к содержанию"
        : "Записаться на курс";
  const statusText = isReadOnlyCourse
    ? "Содержание курса уже доступно для просмотра."
    : !isLogged
      ? "Содержание откроется после входа и записи на курс."
      : isLearningAvailable
        ? course.isCompleted
          ? "Курс уже завершен, можно вернуться к материалам и отзывам."
          : "Вы записаны на курс. Можно продолжить обучение."
        : "Описание и отзывы доступны сразу, а содержание откроется после записи.";

  return (
    <section className="course-side-card">
      <div className="course-side-card-header">
        <p className="course-side-card-label">Действия</p>
        <h2 className="course-side-card-title">Управление курсом</h2>
      </div>

      <div className="course-actions">
        <button
          type="button"
          className="course-primary-btn"
          onClick={onPrimaryAction}
        >
          {primaryButtonLabel}
        </button>
      </div>

      <p className="course-side-card-note">{statusText}</p>
    </section>
  );
}

export default CourseActionsPanel;
