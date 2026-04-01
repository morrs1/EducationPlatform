import CompletedCourseCard from "./CompletedCourseCard";

function CompletedCoursesList({ courses, onToggleFavouriteCourse }) {
  if (courses.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
        Пока нет завершенных курсов.
      </p>
    );
  }

  return (
    <div className="completed-courses-list">
      {courses.map((course) => (
        <CompletedCourseCard
          key={course.id}
          course={course}
          onToggleFavouriteCourse={onToggleFavouriteCourse}
        />
      ))}
    </div>
  );
}

export default CompletedCoursesList;
