function TeachCoursesSection() {
  return (
    <section className="teach-courses-section">
      <div className="teach-courses-section-empty-state">
        <strong className="teach-courses-section-empty-title">
          У вас пока нет курсов
        </strong>
        <p className="teach-courses-section-empty">
          Новый курс можно создать через кнопку слева. После этого он появится
          здесь в списке преподавателя.
        </p>
      </div>
    </section>
  );
}

export default TeachCoursesSection;
