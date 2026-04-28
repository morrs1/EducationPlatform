function HomeDiscoveryPanel({
  searchQuery,
  filters,
  onSearchChange,
  onFilterChange,
  onSubmit,
}) {
  return (
    <section className="home-discovery-panel">
      <div className="home-discovery-copy">
        <span className="home-discovery-badge">
          Спокойный и современный интерфейс обучения
        </span>
        <h2 className="home-discovery-title">
          Подбирайте курсы под свой темп, уровень и интереc.
        </h2>
        <p className="home-discovery-lead">
          Ищите по теме, преподавателю или направлению, а потом быстро сужайте
          подборку фильтрами.
        </p>
      </div>

      <form className="home-discovery-form" onSubmit={onSubmit}>
        <p className="home-discovery-form-label">Быстрый подбор курса</p>

        <div className="home-discovery-input-wrap">
          <input
            type="search"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Название курса, автор или предмет"
            className="home-discovery-input"
          />
        </div>

        <div className="home-discovery-filters">
          <label className="home-discovery-filter">
            <input
              type="checkbox"
              name="filter1"
              checked={filters.filter1}
              onChange={onFilterChange}
            />
            Для начинающих
          </label>

          <label className="home-discovery-filter">
            <input
              type="checkbox"
              name="filter2"
              checked={filters.filter2}
              onChange={onFilterChange}
            />
            Рейтинг 4.8+
          </label>
        </div>

        <button type="submit" className="home-discovery-submit">
          Найти курс
        </button>
      </form>
    </section>
  );
}

export default HomeDiscoveryPanel;
