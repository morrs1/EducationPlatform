import { useEffect, useMemo, useState } from "react";
import { Outlet, useParams } from "react-router";
import {
  isUuid,
  mapReadCourseByIdResponseToCoursePageData,
  requestCourseById,
} from "../../../entities/course";
import { LessonEditorSidebar } from "../../../widgets/lesson-editor-sidebar";

function findLessonLocation(modules, lessonId) {
  for (const module of modules) {
    const lesson = module.lessons.find((item) => item.id === lessonId);

    if (lesson) {
      return {
        module,
        lesson,
      };
    }
  }

  return {
    module: null,
    lesson: null,
  };
}

function LessonEditorPage() {
  const { courseId, lessonId } = useParams();
  const [pageStatus, setPageStatus] = useState(() =>
    courseId && isUuid(courseId) ? "loading" : "error",
  );
  const [pageError, setPageError] = useState("");
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [requestSeed, setRequestSeed] = useState(0);
  const hasValidCourseId = Boolean(courseId && isUuid(courseId));

  useEffect(() => {
    let isCancelled = false;

    async function loadCourse() {
      if (!hasValidCourseId) {
        if (!isCancelled) {
          setCourse(null);
          setModules([]);
          setPageStatus("error");
          setPageError("Не удалось открыть урок для редактирования.");
        }
        return;
      }

      setPageStatus("loading");
      setPageError("");

      try {
        const response = await requestCourseById(courseId);
        const nextPageData = mapReadCourseByIdResponseToCoursePageData(
          response,
          courseId,
        );

        if (!isCancelled) {
          if (nextPageData.course?.isPublished) {
            setCourse(nextPageData.course);
            setModules(nextPageData.syllabus.modules);
            setPageStatus("error");
            setPageError("Опубликованный курс недоступен для редактирования.");
          } else {
            setCourse(nextPageData.course);
            setModules(nextPageData.syllabus.modules);
            setPageStatus("success");
            setPageError("");
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setCourse(null);
          setModules([]);
          setPageStatus("error");
          setPageError(
            error?.message ?? "Не удалось загрузить курс для редактора уроков.",
          );
        }
      }
    }

    loadCourse();

    return () => {
      isCancelled = true;
    };
  }, [courseId, hasValidCourseId, requestSeed]);

  function reloadCourse() {
    setRequestSeed((value) => value + 1);
  }

  const lessonLocation = useMemo(
    () => findLessonLocation(modules, lessonId),
    [lessonId, modules],
  );

  return (
    <div className="lesson-editor-layout">
      <aside className="lesson-editor-layout-sidebar-rail">
        <LessonEditorSidebar
          course={course}
          modules={modules}
          pageStatus={pageStatus}
          activeLessonId={lessonLocation.lesson?.id ?? lessonId ?? null}
        />
      </aside>

      <main className="lesson-editor-layout-main-rail">
        <section className="lesson-editor-page">
          <Outlet
            context={{
              courseId,
              course,
              modules,
              pageStatus,
              pageError,
              reloadCourse,
              activeLesson: lessonLocation.lesson,
              activeModule: lessonLocation.module,
            }}
          />
        </section>
      </main>
    </div>
  );
}

export default LessonEditorPage;
