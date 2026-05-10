import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { normalizeViewerCourseId } from "../../../entities/viewer";
import {
  completeViewerCourseWithLearningService,
  selectCertificateCourseIds,
} from "../../../features/viewer";

export function useLessonCertificate({
  course,
  isBackendCourse,
  isBackendLessonRoute,
  canUseCourseContent,
  isCompletedCourse,
  isEnrolled,
  isLastLesson,
  syllabusLessonIds,
  completedSyllabusLessonIds,
}) {
  const dispatch = useDispatch();
  const certificateCourseIds = useSelector(selectCertificateCourseIds);
  const [isIssuingCertificate, setIsIssuingCertificate] = useState(false);
  const [dialog, setDialog] = useState(null);
  const allSyllabusLessonsCompleted =
    syllabusLessonIds.length > 0 &&
    completedSyllabusLessonIds.length >= syllabusLessonIds.length;
  const hasCertificateAlready = useMemo(() => {
    if (!course?.id) {
      return false;
    }

    const normalizedId = normalizeViewerCourseId(course.id);

    if (normalizedId == null) {
      return false;
    }

    const key = String(normalizedId);

    return certificateCourseIds.some(
      (entry) => String(normalizeViewerCourseId(entry)) === key,
    );
  }, [certificateCourseIds, course?.id]);
  const showCertificateCallout =
    isBackendCourse &&
    isBackendLessonRoute &&
    canUseCourseContent &&
    isLastLesson &&
    allSyllabusLessonsCompleted;

  useEffect(() => {
    if (
      !isBackendLessonRoute ||
      !isEnrolled ||
      isCompletedCourse ||
      !course ||
      !syllabusLessonIds.length ||
      completedSyllabusLessonIds.length < syllabusLessonIds.length
    ) {
      return;
    }

    dispatch(
      completeViewerCourseWithLearningService({
        courseId: course.id,
        courseSnapshot: course,
      }),
    );
  }, [
    completedSyllabusLessonIds.length,
    course,
    dispatch,
    isBackendLessonRoute,
    isCompletedCourse,
    isEnrolled,
    syllabusLessonIds.length,
  ]);

  useEffect(() => {
    if (!dialog) {
      return;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setDialog(null);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [dialog]);

  async function requestCertificate() {
    if (!course) {
      return;
    }

    if (isCompletedCourse && hasCertificateAlready) {
      setDialog({ variant: "success" });

      return;
    }

    setIsIssuingCertificate(true);

    try {
      const result = await dispatch(
        completeViewerCourseWithLearningService({
          courseId: course.id,
          courseSnapshot: course,
        }),
      );

      if (result?.ok) {
        setDialog({ variant: "success" });
      } else {
        setDialog({
          variant: "error",
          message:
            result?.error ??
            "Не удалось оформить сертификат. Попробуйте позже.",
        });
      }
    } catch {
      setDialog({
        variant: "error",
        message: "Не удалось оформить сертификат. Попробуйте позже.",
      });
    } finally {
      setIsIssuingCertificate(false);
    }
  }

  return {
    dialog,
    closeDialog: () => setDialog(null),
    hasCertificateAlready: isCompletedCourse && hasCertificateAlready,
    isIssuingCertificate,
    requestCertificate,
    showCertificateCallout,
  };
}
