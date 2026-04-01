import { useDispatch, useSelector } from "react-redux";
import CompletedCoursesList from "../../../entities/course/ui/completed/CompletedCoursesList";
import {
  selectCompletedCourses,
  toggleFavouriteCourse,
} from "../../../features/viewer";

function CompletedCoursesSection() {
  const dispatch = useDispatch();
  const courses = useSelector(selectCompletedCourses);

  return (
    <section className="completed-courses-section">
      <div className="completed-courses-header">
        <h1 className="completed-courses-title">Завершенные курсы</h1>

        <form
          className="completed-courses-search"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            className="completed-courses-search-input"
            type="search"
            placeholder="Найти курс"
            aria-label="Поиск по пройденным курсам"
          />

          <button type="submit" className="completed-courses-search-btn">
            Искать
          </button>
        </form>
      </div>

      <CompletedCoursesList
        courses={courses}
        onToggleFavouriteCourse={(courseId) =>
          dispatch(toggleFavouriteCourse(courseId))
        }
      />
    </section>
  );
}

export default CompletedCoursesSection;
