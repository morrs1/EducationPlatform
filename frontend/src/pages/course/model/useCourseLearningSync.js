import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { hydrateCompletedLessonsFromLearningService } from "../../../features/lesson-session";
import {
  completeViewerCourseWithLearningService,
  upsertViewerCourseSnapshot,
} from "../../../features/viewer";

export function useCourseLearningSync({
  backendCourseSnapshot,
  canUseCourseContent,
  completedSyllabusLessonIds,
  course,
  isBackendCourseRoute,
  isCompleted,
  isEnrolled,
  isLogged,
  resolvedCourseId,
  syllabusLessonIds,
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!backendCourseSnapshot) {
      return;
    }

    dispatch(upsertViewerCourseSnapshot(backendCourseSnapshot));
  }, [backendCourseSnapshot, dispatch]);

  useEffect(() => {
    if (
      !isBackendCourseRoute ||
      !isLogged ||
      !canUseCourseContent ||
      !resolvedCourseId ||
      !syllabusLessonIds.length
    ) {
      return;
    }

    dispatch(
      hydrateCompletedLessonsFromLearningService({
        courseId: resolvedCourseId,
        courseLessonIds: syllabusLessonIds,
      }),
    );
  }, [
    canUseCourseContent,
    dispatch,
    isBackendCourseRoute,
    isLogged,
    resolvedCourseId,
    syllabusLessonIds,
  ]);

  useEffect(() => {
    if (
      !isBackendCourseRoute ||
      !isLogged ||
      !isEnrolled ||
      isCompleted ||
      !course ||
      !syllabusLessonIds.length ||
      completedSyllabusLessonIds.length < syllabusLessonIds.length
    ) {
      return;
    }

    dispatch(
      completeViewerCourseWithLearningService({
        courseId: course.id,
        courseSnapshot: backendCourseSnapshot,
      }),
    );
  }, [
    backendCourseSnapshot,
    completedSyllabusLessonIds.length,
    course,
    dispatch,
    isBackendCourseRoute,
    isCompleted,
    isEnrolled,
    isLogged,
    syllabusLessonIds.length,
  ]);
}
