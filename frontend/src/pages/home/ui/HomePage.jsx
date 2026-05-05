import { useState } from "react";
import { useNavigate } from "react-router";
import { useHomePopularCourses } from "../lib/useHomePopularCourses";
import { useCatalogCollections } from "../../../features/catalog";
import { HomeDiscoveryPanel } from "../../../widgets/home-discovery";
import { OurCoursesSection } from "../../../widgets/our-courses-section";
import { PopularCoursesSection } from "../../../widgets/popular-courses-section";

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const popularCourses = useHomePopularCourses(18);
  const { allCourses, catalogTagModel } = useCatalogCollections();

  function handleSearchSubmit(event) {
    event.preventDefault();

    const params = new URLSearchParams();
    const normalizedQuery = searchQuery.trim();

    if (normalizedQuery.length > 0) {
      params.set("query", normalizedQuery);
    }

    const search = params.toString();
    navigate(search ? `/search?${search}` : "/search");
  }

  return (
    <div className="home-page">
      <HomeDiscoveryPanel
        searchQuery={searchQuery}
        onSearchChange={(event) => setSearchQuery(event.target.value)}
        onSubmit={handleSearchSubmit}
      />

      <OurCoursesSection
        allCourses={allCourses}
        catalogTagModel={catalogTagModel}
      />

      <PopularCoursesSection popularCourses={popularCourses} />
    </div>
  );
}

export default Home;
