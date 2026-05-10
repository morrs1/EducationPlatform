import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useParams } from "react-router";
import { selectCurrentViewerId } from "../../../features/auth";
import {
  resolveCourseServiceAuthorId,
  selectViewer,
  selectViewerName,
  upsertViewerCourseSnapshot,
} from "../../../features/viewer";
import { createViewerCourseSnapshot } from "../../../entities/viewer";
import {
  enrichCoursePageDataWithAuthorName,
  mapReadCourseByIdResponseToCoursePageData,
  requestAddLessonToCourse,
  requestAddModuleToCourse,
  requestCourseById,
  requestPublishCourse,
} from "../../../entities/course";
import { isUuid } from "../../../shared/lib";
import { CourseBuilderSidebar } from "../../../widgets/course-builder-sidebar";

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
  const [publishStatus, setPublishStatus] = useState("idle");
  const [publishError, setPublishError] = useState("");
  const hasValidCourseId = Boolean(courseId && isUuid(courseId));

  const courseServiceAuthorId = useMemo(
    () => resolveCourseServiceAuthorId(currentViewerId, viewer.remoteId),
    [currentViewerId, viewer.remoteId],
  );

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
      const nextError = "Не удалось открыть курс для редактирования.";
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
      const nextPageData = await enrichCoursePageDataWithAuthorName(
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
      const nextError = error?.message ?? "Не удалось загрузить курс.";

      setCourse(null);
      setModules([]);
      setPageStatus("error");
      setPageError(nextError);

      return {
        ok: false,
        error: nextError,
      };
    }
  }, [applyPageData, courseId, hasValidCourseId]);

  useEffect(() => {
    let isCancelled = false;

    async function loadCourse() {
      if (!hasValidCourseId) {
        if (!isCancelled) {
          setCourse(null);
          setModules([]);
          setPageStatus("error");
          setPageError("Не удалось открыть курс для редактирования.");
        }
        return;
      }

      setPageStatus("loading");
      setPageError("");

      try {
        const response = await requestCourseById(courseId);
        const nextPageData = await enrichCoursePageDataWithAuthorName(
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
            error?.message ?? "Не удалось загрузить курс.",
          );
        }
      }
    }

    loadCourse();

    return () => {
      isCancelled = true;
    };
  }, [applyPageData, courseId, hasValidCourseId, requestSeed]);

  function reloadCourse() {
    setRequestSeed((value) => value + 1);
  }

  async function publishCourse() {
    if (!courseId || !isUuid(courseId) || !course) {
      setPublishError("Не удалось опубликовать курс.");
      return;
    }

    if (course.isPublished) {
      return;
    }

    if (course.authorId !== courseServiceAuthorId) {
      setPublishError("Опубликовать курс может только его автор.");
      return;
    }

    setPublishStatus("loading");
    setPublishError("");

    try {
      await requestPublishCourse(courseId);
      const result = await syncCourse();

      if (!result.ok) {
        setPublishStatus("error");
        setPublishError(
          result.error || "Курс опубликован, но данные не обновились.",
        );
        return;
      }

      setPublishStatus("success");
    } catch (error) {
      setPublishStatus("error");
      setPublishError(error?.message ?? "Не удалось опубликовать курс.");
    }
  }

  async function createModule(payload) {
    if (course?.isPublished) {
      return {
        ok: false,
        error:
          "После публикации можно редактировать содержимое существующих уроков, но не структуру курса.",
      };
    }

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
        error: error?.message ?? "Не удалось создать модуль.",
      };
    }
  }

  async function createLesson(payload) {
    if (course?.isPublished) {
      return {
        ok: false,
        error:
          "После публикации можно редактировать содержимое существующих уроков, но не структуру курса.",
      };
    }

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
        error: error?.message ?? "Не удалось создать урок.",
      };
    }
  }

  return (
    <div className="course-builder-layout">
      <aside className="course-builder-layout-sidebar-rail">
        <CourseBuilderSidebar
          course={course}
          pageStatus={pageStatus}
          onPublishCourse={publishCourse}
          publishStatus={publishStatus}
          publishError={publishError}
          canPublishCourse={
            pageStatus === "success" &&
            Boolean(course) &&
            !course.isPublished &&
            course.authorId === courseServiceAuthorId
          }
        />
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
              canEditStructure: !course?.isPublished,
            }}
          />
        </section>
      </main>
    </div>
  );
}

export default CourseBuilderPage;
