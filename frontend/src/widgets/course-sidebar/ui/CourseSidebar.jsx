import CourseActionsPanel from "../../course-actions-panel/ui/CourseActionsPanel";
import CourseStatsPanel from "../../course-stats-panel/ui/CourseStatsPanel";

function CourseSidebar({
  course,
  isLogged,
  onPrimaryAction,
  onToggleFavourite,
}) {
  return (
    <div className="course-sidebar">
      <CourseActionsPanel
        course={course}
        isLogged={isLogged}
        onPrimaryAction={onPrimaryAction}
        onToggleFavourite={onToggleFavourite}
      />

      <CourseStatsPanel course={course} />
    </div>
  );
}

export default CourseSidebar;
