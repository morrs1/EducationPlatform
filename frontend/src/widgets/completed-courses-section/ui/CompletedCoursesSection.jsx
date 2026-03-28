import CompletedCoursesList from "../../../entities/course/ui/completed/CompletedCoursesList";
function CompletedCoursesSection() {
  return (
    <section className="completed-courses-section">
      <div className="completed-courses-header">
        <h1 className="completed-courses-title">Завершенные курсы</h1>

        <form
          className="completed-courses-search"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            className="completed-courses-search-input"
            type="search"
            placeholder="Найти курс"
            aria-label="Поиск по пройденным курсам"
          />

          <button type="submit" className="completed-courses-search-btn">
            Искать
          </button>
        </form>
      </div>

      <CompletedCoursesList />
    </section>
  );
}

export default CompletedCoursesSection;
