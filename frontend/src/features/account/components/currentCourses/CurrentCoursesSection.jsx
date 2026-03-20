import CurrentCourseCard from "./CurrentCourseCard";
import CurrentCoursesList from "./CurrentCoursesList";

function CurrentCoursesSection() {
  return (
    <section className="current-courses-section">
      <div className="current-courses-header">
        <h1 className="current-courses-title">Текущий прогресс по курсам</h1>

        <form className="current-courses-search" onSubmit={(event) => event.preventDefault()}>
          <input
            className="current-courses-search-input"
            type="search"
            placeholder="Найти курс"
            aria-label="Поиск по текущим курсам"
          />

          <button type="submit" className="current-courses-search-btn">
            Искать
          </button>
        </form>
      </div>

      <CurrentCourseCard />
      <CurrentCourseCard />
      <CurrentCourseCard />
      <CurrentCourseCard />
      <CurrentCourseCard />
    </section>
  );
}

export default CurrentCoursesSection;
