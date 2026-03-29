function HomeDiscoveryPanel({
  searchQuery,
  filters,
  onSearchChange,
  onFilterChange,
  onSubmit,
}) {
  return (
    <section className="home-discovery-panel">
      <form className="home-discovery-form" onSubmit={onSubmit}>
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
            Фильтр 1
          </label>

          <label className="home-discovery-filter">
            <input
              type="checkbox"
              name="filter2"
              checked={filters.filter2}
              onChange={onFilterChange}
            />
            Фильтр 2
          </label>
        </div>

        <button type="submit" className="home-discovery-submit">
          Искать
        </button>
      </form>
    </section>
  );
}

export default HomeDiscoveryPanel;
