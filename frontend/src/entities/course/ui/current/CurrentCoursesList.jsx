import CurrentCourseCard from "./CurrentCourseCard";

function CurrentCoursesList({
  courses,
  onToggleFavouriteCourse,
  onLeaveCourse,
}) {
  if (courses.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
        Пока нет курсов в разделе «Прохожу сейчас».
      </p>
    );
  }

  return (
    <div className="current-courses-list">
      {courses.map((course) => (
        <CurrentCourseCard
          key={course.id}
          course={course}
          onToggleFavouriteCourse={onToggleFavouriteCourse}
          onLeaveCourse={onLeaveCourse}
        />
      ))}
    </div>
  );
}

export default CurrentCoursesList;
