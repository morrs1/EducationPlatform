import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { filterCoursesByQuery } from "../../../entities/course/model/filterCoursesByQuery";
import CompletedCoursesList from "../../../entities/course/ui/completed/CompletedCoursesList";
import {
  selectCompletedCourses,
  toggleFavouriteCourse,
} from "../../../features/viewer";

function CompletedCoursesSection() {
  const dispatch = useDispatch();
  const courses = useSelector(selectCompletedCourses);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCourses = useMemo(
    () => filterCoursesByQuery(courses, searchQuery),
    [courses, searchQuery],
  );
  const isSearchApplied = searchQuery.trim().length > 0;
  const emptyMessage =
    courses.length === 0
      ? "Пока нет завершенных курсов."
      : `По запросу «${searchQuery}» ничего не найдено.`;

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchQuery(inputValue.trim());
  }

  return (
    <section className="completed-courses-section">
      <div className="completed-courses-header">
        <h1 className="completed-courses-title">Завершенные курсы</h1>

        <form className="completed-courses-search" onSubmit={handleSearchSubmit}>
          <input
            className="completed-courses-search-input"
            type="search"
            placeholder="Найти курс"
            aria-label="Поиск по пройденным курсам"
            value={inputValue}
            onChange={(event) => {
              const nextValue = event.target.value;

              setInputValue(nextValue);

              if (nextValue.trim() === "") {
                setSearchQuery("");
              }
            }}
          />

          <button type="submit" className="completed-courses-search-btn">
            Искать
          </button>
        </form>
      </div>

      <CompletedCoursesList
        courses={filteredCourses}
        emptyMessage={isSearchApplied ? emptyMessage : undefined}
        onToggleFavouriteCourse={(courseId) =>
          dispatch(toggleFavouriteCourse(courseId))
        }
      />
    </section>
  );
}

export default CompletedCoursesSection;
