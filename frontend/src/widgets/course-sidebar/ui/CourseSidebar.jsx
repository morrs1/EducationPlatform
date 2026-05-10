import CourseActionsPanel from "./CourseActionsPanel";
import CourseStatsPanel from "./CourseStatsPanel";

function CourseSidebar({
  course,
  isLogged,
  onPrimaryAction,
}) {
  return (
    <div className="course-sidebar">
      <CourseActionsPanel
        course={course}
        isLogged={isLogged}
        onPrimaryAction={onPrimaryAction}
      />

      <CourseStatsPanel course={course} />
    </div>
  );
}

export default CourseSidebar;
