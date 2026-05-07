import { CoursePreviewCard } from "../../../entities/course";

const LEVEL_LABELS = {
  beginner: "Начальный уровень",
  intermediate: "Продвинутый уровень",
};

function SearchResults({ searchQuery, levelFilters, results }) {
  const hasResults = results.length > 0;
  const hasSearchQuery = searchQuery.length > 0;
  const activeFilters = [];

  if (levelFilters?.beginner) {
    activeFilters.push(LEVEL_LABELS.beginner);
  }

  if (levelFilters?.intermediate) {
    activeFilters.push(LEVEL_LABELS.intermediate);
  }

  return (
    <section className="search-results">
      <div className="search-results-head">
        <div className="search-results-heading">
          <p className="search-results-eyebrow">Поиск по каталогу</p>
          <h1 className="search-results-title">
            {hasSearchQuery
              ? `Результаты по запросу «${searchQuery}»`
              : "Все курсы платформы"}
          </h1>
        </div>

        <p className="search-results-summary">
          {hasResults
            ? `Найдено ${results.length} курсов.`
            : "Подходящих курсов не найдено. Попробуйте изменить запрос или снять фильтры."}
        </p>
      </div>

      {activeFilters.length > 0 ? (
        <div className="search-results-filters">
          {activeFilters.map((filterLabel) => (
            <span key={filterLabel} className="search-results-filter-chip">
              {filterLabel}
            </span>
          ))}
        </div>
      ) : null}

      {hasResults ? (
        <div className="home-courses-grid">
          {results.map((course) => (
            <CoursePreviewCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="search-results-empty-state">
          <strong className="search-results-empty-title">
            Ничего не нашлось
          </strong>
          <p className="search-results-empty-text">
            Попробуйте поискать по названию курса.
          </p>
        </div>
      )}
    </section>
  );
}

export default SearchResults;
