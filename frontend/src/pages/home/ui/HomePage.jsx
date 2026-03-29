import { useState } from "react";
import { useNavigate } from "react-router";
import { getHomePageData } from "../lib/getHomePageData";
import HomeDiscoveryPanel from "../../../widgets/home-discovery/ui/HomeDiscoveryPanel";
import OurCoursesSection from "../../../widgets/our-courses-section/ui/OurCoursesSection";
import PopularCoursesSection from "../../../widgets/popular-courses-section/ui/PopularCoursesSection";

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    filter1: false,
    filter2: false,
  });

  const { courseCategories, coursesByCategory, popularCourses } =
    getHomePageData();

  function handleFilterChange(event) {
    const { name, checked } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

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

    const search = params.toString();
    navigate(search ? `/search?${search}` : "/search");
  }

  return (
    <div className="home-page">
      <HomeDiscoveryPanel
        searchQuery={searchQuery}
        filters={filters}
        onSearchChange={(event) => setSearchQuery(event.target.value)}
        onFilterChange={handleFilterChange}
        onSubmit={handleSearchSubmit}
      />

      <OurCoursesSection
        courseCategories={courseCategories}
        coursesByCategory={coursesByCategory}
      />

      <PopularCoursesSection popularCourses={popularCourses} />
    </div>
  );
}

export default Home;
