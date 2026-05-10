import { useEffect, useState } from "react";

import {
  enrichCoursePageDataWithAuthorName,
  mapReadLessonByIdResponseToLessonPageData,
  requestCourseById,
  requestLessonById,
} from "../../../entities/course";

export function useBackendLessonPageData({ courseId, lessonId, enabled }) {
  const [status, setStatus] = useState(() => (enabled ? "loading" : "idle"));
  const [pageData, setPageData] = useState(null);
  const [resolvedLessonId, setResolvedLessonId] = useState(null);
  const [error, setError] = useState("");
  const [requestSeed, setRequestSeed] = useState(0);

  useEffect(() => {
    if (!enabled || !courseId || !lessonId) {
      return;
    }

    let isCancelled = false;

    async function loadBackendLesson() {
      setStatus("loading");
      setError("");

      try {
        const [courseResponse, lessonResponse] = await Promise.all([
          requestCourseById(courseId),
          requestLessonById(lessonId),
        ]);
        const nextPageData = mapReadLessonByIdResponseToLessonPageData({
          courseId,
          lessonId,
          courseResponse,
          lessonResponse,
        });
        const enrichedPageData =
          await enrichCoursePageDataWithAuthorName(nextPageData);

        if (!isCancelled) {
          setPageData(enrichedPageData);
          setResolvedLessonId(lessonId);
          setStatus("success");
        }
      } catch (requestError) {
        if (!isCancelled) {
          setResolvedLessonId(null);
          setStatus("error");
          setError(requestError?.message ?? "Не удалось загрузить урок.");
        }
      }
    }

    loadBackendLesson();

    return () => {
      isCancelled = true;
    };
  }, [courseId, lessonId, enabled, requestSeed]);

  return {
    status: enabled ? status : "idle",
    pageData: enabled ? pageData : null,
    resolvedLessonId: enabled ? resolvedLessonId : null,
    error: enabled ? error : "",
    retry: () => setRequestSeed((value) => value + 1),
  };
}
