import FavouriteCoursesList from "./FavouriteCoursesList";

function FavouriteCoursesSection() {
  return (
    <section className="favourite-courses-section">
      <div className="favourite-courses-header">
        <h1 className="favourite-courses-title">Избранные курсы</h1>

        <form
          className="favourite-courses-search"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            className="favourite-courses-search-input"
            type="search"
            placeholder="Найти курс"
            aria-label="Поиск по избранному"
          />

          <button type="submit" className="favourite-courses-search-btn">
            Искать
          </button>
        </form>
      </div>

      <FavouriteCoursesList />
    </section>
  );
}

export default FavouriteCoursesSection;
