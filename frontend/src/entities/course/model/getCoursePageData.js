import { mockUsersById } from "../../user/@x/course";
import { getCourseReviews } from "./mockCourseReviews";
import { getCourseSyllabus } from "./mockCourseSyllabus";
import { enrichCourse, getCourseById } from "./selectors";

function enrichReview(review) {
  const author = mockUsersById[review.authorId] ?? null;

  return {
    ...review,
    authorName: author?.name ?? "Студент платформы",
    authorAvatarUrl: author?.avatarUrl ?? "",
    authorHeadline: author?.headline ?? "Студент курса",
  };
}

export function getCoursePageData(courseId) {
  const numericCourseId = Number(courseId);
  const course = getCourseById(numericCourseId);

  if (!course) {
    return null;
  }

  return {
    course: enrichCourse(course),
    syllabus: getCourseSyllabus(numericCourseId),
    reviews: getCourseReviews(numericCourseId).map(enrichReview),
  };
}
