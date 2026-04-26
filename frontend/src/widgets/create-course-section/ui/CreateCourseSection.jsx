function CreateCourseSection() {
  return (
    <section className="create-course-section">
      <div className="create-course-section-head">
        <span className="create-course-section-kicker">НОВЫЙ КУРС</span>
        <h1 className="create-course-section-title">Создание курса</h1>
      </div>

      <label className="create-course-section-field">
        <span className="create-course-section-label">Название курса</span>
        <input
          type="text"
          placeholder="Введите название курса"
          className="create-course-section-input"
        />
      </label>

      <button type="button" className="create-course-section-submit">
        Создать курс
      </button>
    </section>
  );
}

export default CreateCourseSection;
