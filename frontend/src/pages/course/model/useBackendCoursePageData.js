import { useEffect, useState } from "react";

import {
  enrichCoursePageDataWithAuthorName,
  mapReadCourseByIdResponseToCoursePageData,
  requestCourseById,
} from "../../../entities/course";

export function useBackendCoursePageData({ courseId, enabled }) {
  const [status, setStatus] = useState(() => (enabled ? "loading" : "idle"));
  const [pageData, setPageData] = useState(null);
  const [error, setError] = useState("");
  const [requestSeed, setRequestSeed] = useState(0);

  useEffect(() => {
    if (!enabled || !courseId) {
      return;
    }

    let isCancelled = false;

    async function loadBackendCourse() {
      setStatus("loading");
      setError("");

      try {
        const response = await requestCourseById(courseId);
        const nextPageData = await enrichCoursePageDataWithAuthorName(
          mapReadCourseByIdResponseToCoursePageData(response, courseId),
        );

        if (!isCancelled) {
          setPageData(nextPageData);
          setStatus("success");
        }
      } catch (requestError) {
        if (!isCancelled) {
          setPageData(null);
          setStatus("error");
          setError(requestError?.message ?? "Не удалось загрузить курс.");
        }
      }
    }

    loadBackendCourse();

    return () => {
      isCancelled = true;
    };
  }, [courseId, enabled, requestSeed]);

  return {
    status: enabled ? status : "idle",
    pageData: enabled ? pageData : null,
    error: enabled ? error : "",
    retry: () => setRequestSeed((value) => value + 1),
  };
}
