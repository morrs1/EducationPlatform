import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { filterCoursesByQuery } from "../../../entities/course/model/filterCoursesByQuery";
import FavouriteCoursesList from "../../../entities/course/ui/favourite/FavouriteCoursesList";
import {
  selectFavouriteCourses,
  toggleFavouriteCourse,
} from "../../../features/viewer";

function FavouriteCoursesSection() {
  const dispatch = useDispatch();
  const courses = useSelector(selectFavouriteCourses);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCourses = useMemo(
    () => filterCoursesByQuery(courses, searchQuery),
    [courses, searchQuery],
  );
  const isSearchApplied = searchQuery.trim().length > 0;
  const emptyMessage =
    courses.length === 0
      ? "Пока нет курсов в избранном."
      : `По запросу «${searchQuery}» ничего не найдено.`;

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchQuery(inputValue.trim());
  }

  return (
    <section className="favourite-courses-section">
      <div className="favourite-courses-header">
        <h1 className="favourite-courses-title">Избранные курсы</h1>

        <form className="favourite-courses-search" onSubmit={handleSearchSubmit}>
          <input
            className="favourite-courses-search-input"
            type="search"
            placeholder="Найти курс"
            aria-label="Поиск по избранному"
            value={inputValue}
            onChange={(event) => {
              const nextValue = event.target.value;

              setInputValue(nextValue);

              if (nextValue.trim() === "") {
                setSearchQuery("");
              }
            }}
          />

          <button type="submit" className="favourite-courses-search-btn">
            Искать
          </button>
        </form>
      </div>

      <FavouriteCoursesList
        courses={filteredCourses}
        emptyMessage={isSearchApplied ? emptyMessage : undefined}
        onToggleFavouriteCourse={(courseId) =>
          dispatch(toggleFavouriteCourse(courseId))
        }
      />
    </section>
  );
}

export default FavouriteCoursesSection;
