import { useState } from "react";
import { useSearchParams } from "react-router";
import { HomeDiscoveryPanel } from "../../../widgets/home-discovery";
import { SearchResults } from "../../../widgets/search-results";
import { getSearchPageData } from "../lib/getSearchPageData";

function readFilters(searchParams) {
  return {
    filter1: searchParams.get("filter1") === "true",
    filter2: searchParams.get("filter2") === "true",
  };
}

function buildSearchParams(searchQuery, filters) {
  const params = new URLSearchParams();
  const normalizedQuery = searchQuery.trim();

  if (normalizedQuery.length > 0) {
    params.set("query", normalizedQuery);
  }

  if (filters.filter1) {
    params.set("filter1", "true");
  }

  if (filters.filter2) {
    params.set("filter2", "true");
  }

  return params;
}

function SearchDiscoverySection({
  appliedSearchQuery,
  appliedFilters,
  onApply,
}) {
  const [searchQuery, setSearchQuery] = useState(appliedSearchQuery);
  const [filters, setFilters] = useState(appliedFilters);

  function handleFilterChange(event) {
    const { name, checked } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    onApply(searchQuery, filters);
  }

  return (
    <HomeDiscoveryPanel
      searchQuery={searchQuery}
      filters={filters}
      onSearchChange={(event) => setSearchQuery(event.target.value)}
      onFilterChange={handleFilterChange}
      onSubmit={handleSearchSubmit}
    />
  );
}

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedSearchQuery = searchParams.get("query") ?? "";
  const appliedFilters = readFilters(searchParams);
  const appliedStateKey = [
    appliedSearchQuery,
    appliedFilters.filter1 ? "1" : "0",
    appliedFilters.filter2 ? "1" : "0",
  ].join(":");

  const { results } = getSearchPageData({
    query: appliedSearchQuery,
    filters: appliedFilters,
  });

  return (
    <div className="search-page">
      <SearchDiscoverySection
        key={appliedStateKey}
        appliedSearchQuery={appliedSearchQuery}
        appliedFilters={appliedFilters}
        onApply={(searchQuery, filters) =>
          setSearchParams(buildSearchParams(searchQuery, filters))
        }
      />

      <SearchResults
        searchQuery={appliedSearchQuery.trim()}
        filters={appliedFilters}
        results={results}
      />
    </div>
  );
}

export default SearchPage;
