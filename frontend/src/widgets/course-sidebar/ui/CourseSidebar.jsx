import { CourseActionsPanel } from "../../course-actions-panel";
import { CourseStatsPanel } from "../../course-stats-panel";

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
