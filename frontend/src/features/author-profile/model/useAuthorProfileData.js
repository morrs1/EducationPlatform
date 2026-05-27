import { useEffect, useMemo, useState } from "react";
import { requestViewerDisplayProfileById } from "../../../shared/api";
import { isUuid, normalizeText } from "../../../shared/lib/gatewayValues";
import { loadAuthorPublishedCoursesAsPreviews } from "./loadAuthorPublishedCoursesAsPreviews";
import { toPublicViewerProfile } from "./toPublicViewerProfile";

const initialDataState = {
  status: "idle",
  profile: null,
  courses: [],
  error: "",
};

function scheduleStateUpdate(setter, value) {
  queueMicrotask(() => {
    setter(value);
  });
}

export function useAuthorProfileData(userId) {
  const normalizedId = useMemo(() => normalizeText(userId), [userId]);
  const gate = useMemo(() => {
    if (!isUuid(normalizedId)) {
      return "invalid";
    }

    return "fetch";
  }, [normalizedId]);

  const [dataState, setDataState] = useState(initialDataState);

  useEffect(() => {
    if (gate === "invalid") {
      scheduleStateUpdate(setDataState, {
        status: "invalid",
        profile: null,
        courses: [],
        error: "",
      });
      return;
    }

    let cancelled = false;

    scheduleStateUpdate(setDataState, {
      status: "loading",
      profile: null,
      courses: [],
      error: "",
    });

    async function load() {
      try {
        const [profile, courses] = await Promise.all([
          requestViewerDisplayProfileById(normalizedId),
          loadAuthorPublishedCoursesAsPreviews(normalizedId),
        ]);

        if (cancelled) {
          return;
        }

        setDataState({
          status: "success",
          profile: toPublicViewerProfile(profile),
          courses,
          error: "",
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setDataState({
          status: "error",
          profile: null,
          courses: [],
          error:
            error instanceof Error && error.message
              ? error.message
              : "Не удалось загрузить профиль.",
        });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [gate, normalizedId]);

  return dataState;
}
