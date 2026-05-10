import { useEffect, useMemo, useState } from "react";

import {
  getCourseDescriptionMarkdown,
  parseCourseDescriptionMarkdown,
} from "../../../entities/course";

export function useCourseDescription(course) {
  const [mockStatus, setMockStatus] = useState("loading");
  const [mockMarkdown, setMockMarkdown] = useState("");
  const [requestSeed, setRequestSeed] = useState(0);
  const isBackendCourse = Boolean(course?.isBackendCourse);
  const markdown = !course
    ? ""
    : isBackendCourse
      ? course.description || ""
      : mockMarkdown;
  const status = !course ? "error" : isBackendCourse ? "success" : mockStatus;
  const blocks = useMemo(
    () => parseCourseDescriptionMarkdown(markdown),
    [markdown],
  );

  useEffect(() => {
    if (!course || course.isBackendCourse) {
      return;
    }

    let isCancelled = false;

    async function loadDescription() {
      setMockStatus("loading");

      try {
        const nextMarkdown = await getCourseDescriptionMarkdown(course.id);

        if (!isCancelled) {
          setMockMarkdown(nextMarkdown);
          setMockStatus("success");
        }
      } catch {
        if (!isCancelled) {
          setMockMarkdown("");
          setMockStatus("error");
        }
      }
    }

    loadDescription();

    return () => {
      isCancelled = true;
    };
  }, [course, requestSeed]);

  return {
    blocks,
    status,
    retry: () => setRequestSeed((value) => value + 1),
  };
}
