import {
  enrollInCourse,
  leaveCourse,
  markCourseCompleted,
  mergeCertificateCourseIds,
  syncLearningEnrollment,
} from "./viewerSlice";
import {
  buildProgressByCourseIdFromCompletedLessons,
  getCourseLessonIdsForReset,
  loadCompletedLessonsForActiveCourses,
  loadCourseSnapshotsFromCourseService,
  normalizeCourseId,
  resetLessonStateForCourse,
  resolveLearningViewerId,
  syncCompletedLessonsForActiveCourses,
} from "./learningHelpers";
import {
  isUuid as isLearningUuid,
  requestCertificatesByUser,
  requestCompletedCoursesByUser,
  requestCompleteCourse,
  requestCreateCertificate,
  requestEnrollUserInCourse,
  requestIncompleteCoursesByUser,
  requestLeaveCourse,
} from "../../../shared/api";

export function hydrateViewerLearningFromLearningService(options = {}) {
  return async (dispatch, getState) => {
    const state = getState();
    const remoteViewerId = resolveLearningViewerId(
      state,
      options.remoteViewerId,
    );

    if (!state.auth.isLogged || !remoteViewerId) {
      return {
        ok: false,
        skipped: true,
      };
    }

    try {
      const [enrolledCourseIds, completedCourseIds, certificates] =
        await Promise.all([
          requestIncompleteCoursesByUser(remoteViewerId),
          requestCompletedCoursesByUser(remoteViewerId),
          requestCertificatesByUser(remoteViewerId).catch(() => []),
        ]);
      const { courseSnapshots, missingCourseIds } =
        await loadCourseSnapshotsFromCourseService([
          ...enrolledCourseIds,
          ...completedCourseIds,
        ]);
      const activeEnrolledCourseIds = enrolledCourseIds.filter(
        (courseId) => !missingCourseIds.includes(courseId),
      );
      const activeCompletedCourseIds = completedCourseIds.filter(
        (courseId) => !missingCourseIds.includes(courseId),
      );
      const completedLessonEntries = await loadCompletedLessonsForActiveCourses(
        {
          userId: remoteViewerId,
          courseIds: activeEnrolledCourseIds,
          courseSnapshots,
        },
      );

      dispatch(
        syncLearningEnrollment({
          enrolledCourseIds: activeEnrolledCourseIds,
          completedCourseIds: activeCompletedCourseIds,
          courseSnapshots,
          progressByCourseId:
            buildProgressByCourseIdFromCompletedLessons(
              completedLessonEntries,
            ),
        }),
      );

      const certificateCourseIdsFromApi = certificates
        .map((certificate) => certificate.courseId)
        .filter(
          (certificateCourseId) =>
            certificateCourseId &&
            !missingCourseIds.includes(certificateCourseId),
        );

      if (certificateCourseIdsFromApi.length) {
        dispatch(
          mergeCertificateCourseIds({
            courseIds: certificateCourseIdsFromApi,
          }),
        );
      }

      syncCompletedLessonsForActiveCourses(dispatch, completedLessonEntries);

      await Promise.allSettled(
        missingCourseIds.map((courseId) =>
          requestLeaveCourse({
            userId: remoteViewerId,
            courseId,
          }),
        ),
      );

      return {
        ok: true,
        viewerId: remoteViewerId,
        enrolledCourseIds: activeEnrolledCourseIds,
        completedCourseIds: activeCompletedCourseIds,
        certificates,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error?.message ??
          "Не удалось загрузить учебное состояние.",
      };
    }
  };
}

export function enrollViewerInCourseWithLearningService(payload) {
  return async (dispatch, getState) => {
    const state = getState();
    const courseId = normalizeCourseId(payload?.courseId ?? payload);
    const courseSnapshot = payload?.courseSnapshot ?? null;
    const remoteViewerId = resolveLearningViewerId(
      state,
      payload?.remoteViewerId,
    );
    if (!state.auth.isLogged) {
      return {
        ok: false,
        error: "Войдите в аккаунт, чтобы записаться на курс.",
      };
    }

    if (!isLearningUuid(courseId) || !remoteViewerId) {
      dispatch(enrollInCourse({ courseId, courseSnapshot }));

      return {
        ok: true,
        local: true,
      };
    }

    try {
      await requestEnrollUserInCourse({
        userId: remoteViewerId,
        courseId,
      });

      const hydrationResult = await dispatch(
        hydrateViewerLearningFromLearningService({
          remoteViewerId,
        }),
      );

      if (!hydrationResult?.ok) {
        dispatch(enrollInCourse({ courseId, courseSnapshot }));
      }

      return {
        ok: true,
        viewerId: remoteViewerId,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error?.message ?? "Не удалось записаться на курс.",
      };
    }
  };
}

export function leaveViewerCourseWithLearningService(payload) {
  return async (dispatch, getState) => {
    const state = getState();
    const courseId = normalizeCourseId(payload?.courseId ?? payload);
    const remoteViewerId = resolveLearningViewerId(
      state,
      payload?.remoteViewerId,
    );
    const courseLessonIds = getCourseLessonIdsForReset(state, courseId);

    if (!state.auth.isLogged) {
      return {
        ok: false,
        error: "Войдите в аккаунт, чтобы покинуть курс.",
      };
    }

    if (!isLearningUuid(courseId) || !remoteViewerId) {
      dispatch(leaveCourse(courseId));
      resetLessonStateForCourse(dispatch, courseLessonIds);

      return {
        ok: true,
        local: true,
      };
    }

    try {
      await requestLeaveCourse({
        userId: remoteViewerId,
        courseId,
      });

      const hydrationResult = await dispatch(
        hydrateViewerLearningFromLearningService({
          remoteViewerId,
        }),
      );

      if (!hydrationResult?.ok) {
        dispatch(leaveCourse(courseId));
      }

      resetLessonStateForCourse(dispatch, courseLessonIds);

      return {
        ok: true,
        viewerId: remoteViewerId,
      };
    } catch (error) {
      if (error?.status === 404) {
        dispatch(leaveCourse(courseId));
        resetLessonStateForCourse(dispatch, courseLessonIds);
        await dispatch(
          hydrateViewerLearningFromLearningService({
            remoteViewerId,
          }),
        );

        return {
          ok: true,
          viewerId: remoteViewerId,
        };
      }

      return {
        ok: false,
        error:
          error?.message ??
          "Не удалось покинуть курс.",
      };
    }
  };
}

export function completeViewerCourseWithLearningService(payload) {
  return async (dispatch, getState) => {
    const state = getState();
    const courseId = normalizeCourseId(payload?.courseId ?? payload);
    const courseSnapshot = payload?.courseSnapshot ?? null;
    const remoteViewerId = resolveLearningViewerId(
      state,
      payload?.remoteViewerId,
    );

    if (!isLearningUuid(courseId) || !remoteViewerId) {
      dispatch(markCourseCompleted({ courseId, courseSnapshot }));

      return {
        ok: true,
        local: true,
      };
    }

    try {
      const completeCourseBody = await requestCompleteCourse({
        userId: remoteViewerId,
        courseId,
      });
      const enrollmentId = normalizeCourseId(
        completeCourseBody?.enrollmentId,
      );

      if (isLearningUuid(enrollmentId)) {
        try {
          await requestCreateCertificate({
            enrollmentId,
          });
          dispatch(mergeCertificateCourseIds({ courseIds: [courseId] }));
        } catch (certificateError) {
          if (certificateError?.status === 409) {
            dispatch(mergeCertificateCourseIds({ courseIds: [courseId] }));
          }
        }
      }

      const hydrationResult = await dispatch(
        hydrateViewerLearningFromLearningService({
          remoteViewerId,
        }),
      );

      if (!hydrationResult?.ok) {
        dispatch(markCourseCompleted({ courseId, courseSnapshot }));
      }

      return {
        ok: true,
        viewerId: remoteViewerId,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error?.message ??
          "Не удалось завершить курс.",
      };
    }
  };
}
