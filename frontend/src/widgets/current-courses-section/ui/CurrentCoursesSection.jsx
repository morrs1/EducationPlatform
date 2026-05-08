import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CurrentCoursesList,
  filterCoursesByQuery,
} from "../../../entities/course";
import { selectCurrentViewerId, selectIsLogged } from "../../../features/auth";
import {
  hydrateViewerLearningFromLearningService,
  leaveViewerCourseWithLearningService,
  selectCurrentCourses,
} from "../../../features/viewer";

function CurrentCoursesSection() {
  const dispatch = useDispatch();
  const isLogged = useSelector(selectIsLogged);
  const currentViewerId = useSelector(selectCurrentViewerId);
  const courses = useSelector(selectCurrentCourses);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [leavingCourseId, setLeavingCourseId] = useState(null);
  const [leaveError, setLeaveError] = useState("");
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
    if (!isLogged || !currentViewerId) {
      return;
    }

    dispatch(hydrateViewerLearningFromLearningService());
  }, [dispatch, isLogged, currentViewerId]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearchQuery(inputValue.trim());
  }

  async function handleLeaveCourse(courseId) {
    setLeavingCourseId(courseId);
    setLeaveError("");

    const result = await dispatch(
      leaveViewerCourseWithLearningService({
        courseId,
      }),
    );

    if (!result?.ok) {
      setLeaveError(result?.error ?? "Не удалось покинуть курс.");
    }

    setLeavingCourseId(null);
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
            onChange={(event) => {
              const nextValue = event.target.value;

              setInputValue(nextValue);

              if (nextValue.trim() === "") {
                setSearchQuery("");
              }
            }}
          />

          <button type="submit" className="current-courses-search-btn">
            Искать
          </button>
        </form>
      </div>

      {leaveError ? (
        <p className="settings-feedback-error">{leaveError}</p>
      ) : null}

      <CurrentCoursesList
        courses={filteredCourses}
        emptyMessage={isSearchApplied ? emptyMessage : undefined}
        leavingCourseId={leavingCourseId}
        onLeaveCourse={handleLeaveCourse}
      />
    </section>
  );
}

export default CurrentCoursesSection;
