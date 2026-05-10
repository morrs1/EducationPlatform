import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useParams } from "react-router";
import {
  enrichCoursePageDataWithAuthorName,
  mapReadCourseByIdResponseToCoursePageData,
  requestCourseById,
} from "../../../entities/course";
import { selectCurrentViewerId } from "../../../features/auth";
import {
  resolveCourseServiceAuthorId,
  selectViewer,
} from "../../../features/viewer";
import { isUuid } from "../../../shared/lib";
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
  const currentViewerId = useSelector(selectCurrentViewerId);
  const viewer = useSelector(selectViewer);
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
        const nextPageData = await enrichCoursePageDataWithAuthorName(
          mapReadCourseByIdResponseToCoursePageData(
            response,
            courseId,
          ),
        );

        if (!isCancelled) {
          if (
            nextPageData.course?.isPublished &&
            nextPageData.course?.authorId !== courseServiceAuthorId
          ) {
            setCourse(nextPageData.course);
            setModules(nextPageData.syllabus.modules);
            setPageStatus("error");
            setPageError(
              "Редактировать уроки опубликованного курса может только автор.",
            );
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
  }, [courseId, courseServiceAuthorId, hasValidCourseId, requestSeed]);

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
