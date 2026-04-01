import { useDispatch, useSelector } from "react-redux";
import CurrentCoursesList from "../../../entities/course/ui/current/CurrentCoursesList";
import {
  leaveCourse,
  selectCurrentCourses,
  toggleFavouriteCourse,
} from "../../../features/viewer";

function CurrentCoursesSection() {
  const dispatch = useDispatch();
  const courses = useSelector(selectCurrentCourses);

  return (
    <section className="current-courses-section">
      <div className="current-courses-header">
        <h1 className="current-courses-title">Текущий прогресс по курсам</h1>

        <form
          className="current-courses-search"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            className="current-courses-search-input"
            type="search"
            placeholder="Найти курс"
            aria-label="Поиск по текущим курсам"
          />

          <button type="submit" className="current-courses-search-btn">
            Искать
          </button>
        </form>
      </div>

      <CurrentCoursesList
        courses={courses}
        onToggleFavouriteCourse={(courseId) =>
          dispatch(toggleFavouriteCourse(courseId))
        }
        onLeaveCourse={(courseId) => dispatch(leaveCourse(courseId))}
      />
    </section>
  );
}

export default CurrentCoursesSection;
