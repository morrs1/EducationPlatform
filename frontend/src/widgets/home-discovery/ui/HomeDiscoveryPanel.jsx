function HomeDiscoveryPanel({
  searchQuery,
  onSearchChange,
  onSubmit,
  filtersSlot = null,
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
      </div>

      <form className="home-discovery-form" onSubmit={onSubmit}>
        <p className="home-discovery-form-label">Быстрый подбор курса</p>

        <div className="home-discovery-input-wrap">
          <input
            type="search"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Название курса"
            className="home-discovery-input"
          />
        </div>

        {filtersSlot ? (
          <div className="home-discovery-filters">{filtersSlot}</div>
        ) : null}

        <button type="submit" className="home-discovery-submit">
          Найти курс
        </button>
      </form>
    </section>
  );
}

export default HomeDiscoveryPanel;
