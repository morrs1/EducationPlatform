import { getMockCourses } from "../../course/@x/lesson";
import { mockLessons } from "./mockLessons";

export function getLessonPageData(lessonId) {
  const lesson = mockLessons.find((item) => item.id === lessonId);

  if (!lesson) {
    return null;
  }

  const course =
    getMockCourses().find((item) => item.id === lesson.courseId) ?? null;

  return {
    course,
    lesson,
  };
}
