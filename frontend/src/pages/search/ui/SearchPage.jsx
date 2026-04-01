import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import HomeDiscoveryPanel from "../../../widgets/home-discovery/ui/HomeDiscoveryPanel";
import SearchResults from "../../../widgets/search-results/ui/SearchResults";
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

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedSearchQuery = searchParams.get("query") ?? "";
  const appliedFilters = readFilters(searchParams);
  const [searchQuery, setSearchQuery] = useState(appliedSearchQuery);
  const [filters, setFilters] = useState(appliedFilters);

  useEffect(() => {
    setSearchQuery(appliedSearchQuery);
    setFilters(appliedFilters);
  }, [appliedSearchQuery, appliedFilters.filter1, appliedFilters.filter2]);

  const { results } = getSearchPageData({
    query: appliedSearchQuery,
    filters: appliedFilters,
  });

  function handleFilterChange(event) {
    const { name, checked } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchParams(buildSearchParams(searchQuery, filters));
  }

  return (
    <div className="search-page">
      <HomeDiscoveryPanel
        searchQuery={searchQuery}
        filters={filters}
        onSearchChange={(event) => setSearchQuery(event.target.value)}
        onFilterChange={handleFilterChange}
        onSubmit={handleSearchSubmit}
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
