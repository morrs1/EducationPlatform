function LessonNavigationFooter({
  isLessonViewed,
  isLessonCompleted,
  previousLesson,
  nextLesson,
  onOpenPreviousLesson,
  onOpenNextLesson,
  isTransitioning,
}) {
  return (
    <div className="lesson-navigation-footer">
      <div
        className={`lesson-progress-status ${
          isLessonCompleted ? "completed" : isLessonViewed ? "in-progress" : ""
        }`}
      >
        {isLessonCompleted
          ? "Урок пройден"
          : isLessonViewed
            ? "Урок начат"
            : "Урок не начат"}
      </div>

      <div className="lesson-navigation-actions">
        <button
          type="button"
          className="course-inline-btn"
          onClick={onOpenPreviousLesson}
          disabled={!previousLesson || isTransitioning}
        >
          Предыдущий урок
        </button>

        <button
          type="button"
          className="course-primary-btn"
          onClick={onOpenNextLesson}
          disabled={!nextLesson || isTransitioning}
        >
          Следующий урок
        </button>
      </div>
    </div>
  );
}

export default LessonNavigationFooter;
