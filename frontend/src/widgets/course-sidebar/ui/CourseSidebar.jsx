import CourseStatsPanel from "./CourseStatsPanel";

function CourseSidebar({ course }) {
  return (
    <div className="course-sidebar">
      <CourseStatsPanel course={course} />
    </div>
  );
}

export default CourseSidebar;
