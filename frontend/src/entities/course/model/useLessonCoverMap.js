import { useEffect, useMemo, useState } from "react";

import {
  extractLessonCoverAssetFromLessonResponse,
  requestLessonById,
} from "./courseServiceApi";

function getUniqueLessonIds(modules) {
  return Array.from(
    new Set(
      (modules ?? []).flatMap((module) =>
        (module?.lessons ?? [])
          .map((lesson) => lesson?.id || lesson?.lessonId)
          .filter(Boolean),
      ),
    ),
  );
}

export function useLessonCoverMap(modules, { enabled = true } = {}) {
  const [lessonCoverById, setLessonCoverById] = useState({});
  const lessonIds = useMemo(() => getUniqueLessonIds(modules), [modules]);

  useEffect(() => {
    let isCancelled = false;

    if (!enabled || !lessonIds.length) {
      return () => {
        isCancelled = true;
      };
    }

    async function loadLessonCovers() {
      const entries = await Promise.all(
        lessonIds.map(async (lessonId) => {
          try {
            const lessonResponse = await requestLessonById(lessonId);
            const coverAsset =
              extractLessonCoverAssetFromLessonResponse(lessonResponse);

            return [lessonId, coverAsset?.url || ""];
          } catch {
            return [lessonId, ""];
          }
        }),
      );

      if (!isCancelled) {
        setLessonCoverById(Object.fromEntries(entries));
      }
    }

    loadLessonCovers();

    return () => {
      isCancelled = true;
    };
  }, [enabled, lessonIds]);

  return lessonCoverById;
}
