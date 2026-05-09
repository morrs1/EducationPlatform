import { useEffect, useMemo, useState } from "react";

import { parseLessonMarkdown } from "../../../entities/lesson";
import {
  getCachedLessonContentMarkdown,
  getLessonContentMarkdown,
} from "../lib/getLessonContentMarkdown";

export function useLessonContent(lesson) {
  const [contentStatus, setContentStatus] = useState("idle");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [contentError, setContentError] = useState("");

  useEffect(() => {
    if (!lesson) {
      return;
    }

    let isCancelled = false;

    async function loadLessonContent() {
      const cachedMarkdown = getCachedLessonContentMarkdown(lesson);

      if (cachedMarkdown) {
        setContentMarkdown(cachedMarkdown);
        setContentStatus("success");
        setContentError("");
        return;
      }

      setContentStatus("loading");
      setContentMarkdown("");
      setContentError("");

      try {
        const markdown = await getLessonContentMarkdown(lesson);

        if (!isCancelled) {
          setContentMarkdown(markdown);
          setContentStatus("success");
        }
      } catch (error) {
        if (!isCancelled) {
          setContentMarkdown("");
          setContentStatus("error");
          setContentError(
            error?.message ?? "Не удалось загрузить содержимое урока.",
          );
        }
      }
    }

    loadLessonContent();

    return () => {
      isCancelled = true;
    };
  }, [lesson]);

  const contentBlocks = useMemo(
    () => parseLessonMarkdown(lesson ? contentMarkdown : ""),
    [contentMarkdown, lesson],
  );

  if (!lesson) {
    return {
      contentStatus: "idle",
      contentBlocks: [],
      contentError: "",
    };
  }

  return {
    contentStatus,
    contentBlocks,
    contentError,
  };
}
