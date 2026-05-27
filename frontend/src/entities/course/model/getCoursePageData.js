import { getCourseSyllabus } from "./mockCourseSyllabus";
import { enrichCourse, getCourseById } from "./selectors";

export function getCoursePageData(courseId) {
  const numericCourseId = Number(courseId);
  const course = getCourseById(numericCourseId);

  if (!course) {
    return null;
  }

  return {
    course: enrichCourse(course),
    syllabus: getCourseSyllabus(numericCourseId),
  };
}
