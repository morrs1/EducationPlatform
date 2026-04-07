import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CurrentCoursesList from "../../../entities/course/ui/current/CurrentCoursesList";
import { filterCoursesByQuery } from "../../../entities/course/model/filterCoursesByQuery";
import {
  leaveCourse,
  selectCurrentCourses,
  toggleFavouriteCourse,
} from "../../../features/viewer";

function CurrentCoursesSection() {
  const dispatch = useDispatch();
  const courses = useSelector(selectCurrentCourses);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCourses = useMemo(
    () => filterCoursesByQuery(courses, searchQuery),
    [courses, searchQuery],
  );
  const isSearchApplied = searchQuery.trim().length > 0;
  const emptyMessage =
    courses.length === 0
      ? "Пока нет курсов в разделе «Прохожу сейчас»."
      : `По запросу «${searchQuery}» ничего не найдено.`;

  useEffect(() => {
    if (inputValue.trim() === "") {
      setSearchQuery("");
    }
  }, [inputValue]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearchQuery(inputValue.trim());
  }

  return (
    <section className="current-courses-section">
      <div className="current-courses-header">
        <h1 className="current-courses-title">Текущий прогресс по курсам</h1>

        <form className="current-courses-search" onSubmit={handleSearchSubmit}>
          <input
            className="current-courses-search-input"
            type="search"
            placeholder="Найти курс"
            aria-label="Поиск по текущим курсам"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <button type="submit" className="current-courses-search-btn">
            Искать
          </button>
        </form>
      </div>

      <CurrentCoursesList
        courses={filteredCourses}
        emptyMessage={isSearchApplied ? emptyMessage : undefined}
        onToggleFavouriteCourse={(courseId) =>
          dispatch(toggleFavouriteCourse(courseId))
        }
        onLeaveCourse={(courseId) => dispatch(leaveCourse(courseId))}
      />
    </section>
  );
}

export default CurrentCoursesSection;
