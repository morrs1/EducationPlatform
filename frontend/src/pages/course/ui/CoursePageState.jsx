function CoursePageState({
  action,
  label,
  onAction,
  text,
  title,
}) {
  return (
    <div className="course-page">
      <section className="course-not-found">
        <p className="course-not-found-label">{label}</p>
        <h1 className="course-not-found-title">{title}</h1>
        <p className="course-not-found-text">{text}</p>
        {action ? (
          <button
            type="button"
            className="course-inline-btn"
            onClick={onAction}
          >
            {action}
          </button>
        ) : null}
      </section>
    </div>
  );
}

export default CoursePageState;
