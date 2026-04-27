function CourseDescriptionSection() {
  return (
    <section className="course-description-section">
      <header className="course-description-section-head">
        <span className="course-builder-section-kicker">ОПИСАНИЕ КУРСА</span>
        <h1 className="course-builder-section-title">Оформление и позиционирование</h1>
        <p className="course-builder-section-description">
          Здесь позже появятся основные поля для презентации курса: название,
          краткое описание, польза для студента и структура вводного экрана.
        </p>
      </header>

      <div className="course-description-card-grid">
        <article className="course-description-card">
          <strong className="course-description-card-title">
            Основная информация
          </strong>
          <p className="course-description-card-text">
            Название курса, краткая аннотация и обещание результата для
            студента.
          </p>
        </article>

        <article className="course-description-card">
          <strong className="course-description-card-title">Для кого курс</strong>
          <p className="course-description-card-text">
            Блок с целевой аудиторией, уровнем подготовки и сценариями
            прохождения.
          </p>
        </article>

        <article className="course-description-card">
          <strong className="course-description-card-title">
            Что будет на экране курса
          </strong>
          <p className="course-description-card-text">
            Здесь потом можно разместить cover, преимущества и навигационные
            акценты.
          </p>
        </article>
      </div>
    </section>
  );
}

export default CourseDescriptionSection;
