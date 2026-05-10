import { useMemo } from "react";
import { getPopularCourses } from "../../../entities/course";

export function useHomePopularCourses(limit = 18) {
  return useMemo(
    () => getPopularCourses(limit),
    [limit],
  );
}
