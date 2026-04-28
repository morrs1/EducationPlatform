import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useParams } from "react-router";
import { selectCurrentViewerId } from "../../../features/auth";
import {
  createViewerCourseSnapshot,
  requestViewerDisplayProfileById,
  resolveCourseServiceAuthorId,
  selectViewer,
  selectViewerName,
  upsertViewerCourseSnapshot,
} from "../../../features/viewer";
import {
  isUuid,
  mapReadCourseByIdResponseToCoursePageData,
  requestAddLessonToCourse,
  requestAddModuleToCourse,
  requestCourseById,
} from "../../../entities/course/model/courseServiceApi";
import CourseBuilderSidebar from "../../../widgets/course-builder-sidebar/ui/CourseBuilderSidebar";

function collectSyllabusLessonIds(modules) {
  return modules.flatMap((module) =>
    module.lessons.map((lesson) => lesson.lessonId).filter(Boolean),
  );
}

function CourseBuilderPage() {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const currentViewerId = useSelector(selectCurrentViewerId);
  const viewer = useSelector(selectViewer);
  const viewerName = useSelector(selectViewerName);
  const [pageStatus, setPageStatus] = useState(() =>
    courseId && isUuid(courseId) ? "loading" : "error",
  );
  const [pageError, setPageError] = useState("");
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [requestSeed, setRequestSeed] = useState(0);
  const hasValidCourseId = Boolean(courseId && isUuid(courseId));

  const courseServiceAuthorId = useMemo(
    () => resolveCourseServiceAuthorId(currentViewerId, viewer.remoteId),
    [currentViewerId, viewer.remoteId],
  );

  const enrichBackendCourseAuthor = useCallback(async (nextPageData) => {
    const nextCourse = nextPageData?.course;

    if (!nextCourse) {
      return nextPageData;
    }

    if (viewerName && nextCourse.authorId === courseServiceAuthorId) {
      return {
        ...nextPageData,
        course: {
          ...nextCourse,
          authorName: viewerName,
        },
      };
    }

    if (!nextCourse.authorId) {
      return nextPageData;
    }

    try {
      const authorProfile = await requestViewerDisplayProfileById(
        nextCourse.authorId,
      );

      if (!authorProfile?.name) {
        return nextPageData;
      }

      return {
        ...nextPageData,
        course: {
          ...nextCourse,
          authorName: authorProfile.name,
        },
      };
    } catch {
      return nextPageData;
    }
  }, [courseServiceAuthorId, viewerName]);

  const applyPageData = useCallback((nextPageData) => {
    const nextCourse = nextPageData.course;
    const nextModules = nextPageData.syllabus.modules;
    const syllabusLessonIds = collectSyllabusLessonIds(nextModules);

    setCourse(nextCourse);
    setModules(nextModules);
    setPageStatus("success");
    setPageError("");

    dispatch(
      upsertViewerCourseSnapshot(
        createViewerCourseSnapshot(nextCourse, syllabusLessonIds),
      ),
    );
  }, [dispatch]);

  const syncCourse = useCallback(async () => {
    if (!hasValidCourseId) {
      const nextError = "Некорректный UUID курса для конструктора.";
      setCourse(null);
      setModules([]);
      setPageStatus("error");
      setPageError(nextError);

      return {
        ok: false,
        error: nextError,
      };
    }

    try {
      const response = await requestCourseById(courseId);
      const nextPageData = await enrichBackendCourseAuthor(
        mapReadCourseByIdResponseToCoursePageData(
          response,
          courseId,
        ),
      );

      applyPageData(nextPageData);

      return {
        ok: true,
      };
    } catch (error) {
      const nextError =
        error?.message ?? "Не удалось загрузить курс из course_service.";

      setCourse(null);
      setModules([]);
      setPageStatus("error");
      setPageError(nextError);

      return {
        ok: false,
        error: nextError,
      };
    }
  }, [applyPageData, courseId, enrichBackendCourseAuthor, hasValidCourseId]);

  useEffect(() => {
    let isCancelled = false;

    async function loadCourse() {
      if (!hasValidCourseId) {
        if (!isCancelled) {
          setCourse(null);
          setModules([]);
          setPageStatus("error");
          setPageError("Некорректный UUID курса для конструктора.");
        }
        return;
      }

      setPageStatus("loading");
      setPageError("");

      try {
        const response = await requestCourseById(courseId);
        const nextPageData = await enrichBackendCourseAuthor(
          mapReadCourseByIdResponseToCoursePageData(
            response,
            courseId,
          ),
        );

        if (!isCancelled) {
          applyPageData(nextPageData);
        }
      } catch (error) {
        if (!isCancelled) {
          setCourse(null);
          setModules([]);
          setPageStatus("error");
          setPageError(
            error?.message ?? "Не удалось загрузить курс из course_service.",
          );
        }
      }
    }

    loadCourse();

    return () => {
      isCancelled = true;
    };
  }, [
    applyPageData,
    courseId,
    enrichBackendCourseAuthor,
    hasValidCourseId,
    requestSeed,
  ]);

  function reloadCourse() {
    setRequestSeed((value) => value + 1);
  }

  async function createModule(payload) {
    if (!courseId || !isUuid(courseId)) {
      return {
        ok: false,
        error: "Сначала нужен корректный courseId.",
      };
    }

    try {
      await requestAddModuleToCourse(courseId, payload);
      return await syncCourse();
    } catch (error) {
      return {
        ok: false,
        error:
          error?.message ?? "Не удалось создать модуль через course_service.",
      };
    }
  }

  async function createLesson(payload) {
    if (!courseId || !isUuid(courseId)) {
      return {
        ok: false,
        error: "Сначала нужен корректный courseId.",
      };
    }

    try {
      await requestAddLessonToCourse({
        ...payload,
        courseId,
      });
      return await syncCourse();
    } catch (error) {
      return {
        ok: false,
        error:
          error?.message ?? "Не удалось создать урок через course_service.",
      };
    }
  }

  return (
    <div className="course-builder-layout">
      <aside className="course-builder-layout-sidebar-rail">
        <CourseBuilderSidebar course={course} pageStatus={pageStatus} />
      </aside>

      <main className="course-builder-layout-main-rail">
        <section className="course-builder-page">
          <Outlet
            context={{
              courseId,
              course,
              modules,
              pageStatus,
              pageError,
              viewerName,
              reloadCourse,
              createModule,
              createLesson,
            }}
          />
        </section>
      </main>
    </div>
  );
}

export default CourseBuilderPage;
