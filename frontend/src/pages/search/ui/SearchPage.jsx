import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { HomeDiscoveryPanel } from "../../../widgets/home-discovery";
import { SearchResults } from "../../../widgets/search-results";
import {
  enrichCoursePageDataWithAuthorName,
  mapCourseToPreview,
  mapReadCourseByIdResponseToCoursePageData,
  requestAllCourses,
  requestSearchCourses,
} from "../../../entities/course";

const LEVEL_KEYS = ["beginner", "intermediate"];

function readLevelFiltersFromSearchParams(searchParams) {
  const levelSet = new Set(
    searchParams
      .getAll("level")
      .filter((value) => LEVEL_KEYS.includes(value)),
  );

  if (searchParams.get("filter1") === "true") {
    levelSet.add("beginner");
  }

  return {
    beginner: levelSet.has("beginner"),
    intermediate: levelSet.has("intermediate"),
  };
}

function buildSearchParams(searchQuery, levelFilters) {
  const params = new URLSearchParams();
  const normalizedQuery = searchQuery.trim();

  if (normalizedQuery.length > 0) {
    params.set("query", normalizedQuery);
  }

  if (levelFilters.beginner) {
    params.append("level", "beginner");
  }

  if (levelFilters.intermediate) {
    params.append("level", "intermediate");
  }

  return params;
}

function matchesLevelFilters(course, levelFilters) {
  const anyLevelSelected =
    levelFilters.beginner || levelFilters.intermediate;

  if (!anyLevelSelected) {
    return true;
  }

  const level = course.level ?? "";

  return (
    (levelFilters.beginner && level === "beginner") ||
    (levelFilters.intermediate && level === "intermediate")
  );
}

function SearchDiscoverySection({
  appliedSearchQuery,
  appliedLevelFilters,
  onApply,
}) {
  const [searchQuery, setSearchQuery] = useState(appliedSearchQuery);
  const [levelFilters, setLevelFilters] = useState(appliedLevelFilters);

  function handleLevelChange(levelKey) {
    return (event) => {
      const { checked } = event.target;

      setLevelFilters((previous) => ({
        ...previous,
        [levelKey]: checked,
      }));
    };
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    onApply(searchQuery, levelFilters);
  }

  return (
    <HomeDiscoveryPanel
      searchQuery={searchQuery}
      onSearchChange={(event) => setSearchQuery(event.target.value)}
      onSubmit={handleSearchSubmit}
      filtersSlot={
        <>
          <label className="home-discovery-filter">
            <input
              type="checkbox"
              checked={levelFilters.beginner}
              onChange={handleLevelChange("beginner")}
            />
            Начальный уровень
          </label>
          <label className="home-discovery-filter">
            <input
              type="checkbox"
              checked={levelFilters.intermediate}
              onChange={handleLevelChange("intermediate")}
            />
            Продвинутый уровень
          </label>
        </>
      }
    />
  );
}

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedSearchQuery = searchParams.get("query") ?? "";
  const appliedLevelFilters = readLevelFiltersFromSearchParams(searchParams);
  const appliedStateKey = [
    appliedSearchQuery,
    appliedLevelFilters.beginner ? "b" : "",
    appliedLevelFilters.intermediate ? "i" : "",
  ].join(":");

  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const normalizedQuery = appliedSearchQuery.trim();

  const filteredResults = useMemo(
    () =>
      results.filter((course) =>
        matchesLevelFilters(course, appliedLevelFilters),
      ),
    [
      results,
      appliedLevelFilters.beginner,
      appliedLevelFilters.intermediate,
    ],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError("");

      try {
        const responseList = normalizedQuery
          ? await requestSearchCourses(normalizedQuery)
          : await requestAllCourses();
        const pageDataList = await Promise.all(
          responseList.map(async (courseResponse) =>
            enrichCoursePageDataWithAuthorName(
              mapReadCourseByIdResponseToCoursePageData(courseResponse, ""),
            ),
          ),
        );
        const nextResults = pageDataList
          .map((pageData) => pageData?.course)
          .filter((course) => course?.isPublished)
          .map(mapCourseToPreview);

        if (!cancelled) {
          setResults(nextResults);
          setStatus("ready");
        }
      } catch (loadError) {
        if (!cancelled) {
          setResults([]);
          setStatus("error");
          setError(
            loadError?.message ??
              "Не удалось загрузить результаты поиска. Попробуйте позже.",
          );
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [normalizedQuery]);

  return (
    <div className="search-page">
      <SearchDiscoverySection
        key={appliedStateKey}
        appliedSearchQuery={appliedSearchQuery}
        appliedLevelFilters={appliedLevelFilters}
        onApply={(searchQuery, levelFilters) =>
          setSearchParams(buildSearchParams(searchQuery, levelFilters))
        }
      />

      {status === "error" ? (
        <div className="search-results">
          <div className="search-results-empty-state">
            <strong className="search-results-empty-title">
              Не удалось загрузить
            </strong>
            <p className="search-results-empty-text">{error}</p>
          </div>
        </div>
      ) : (
        <SearchResults
          searchQuery={normalizedQuery}
          levelFilters={appliedLevelFilters}
          results={filteredResults}
        />
      )}
    </div>
  );
}

export default SearchPage;
