import FavouriteCourseCard from "./FavouriteCourseCard";

function FavouriteCoursesList({ courses, onToggleFavouriteCourse }) {
  if (courses.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
        Пока нет курсов в избранном.
      </p>
    );
  }

  return (
    <div className="favourite-courses-list">
      {courses.map((course) => (
        <FavouriteCourseCard
          key={course.id}
          course={course}
          onToggleFavouriteCourse={onToggleFavouriteCourse}
        />
      ))}
    </div>
  );
}

export default FavouriteCoursesList;
