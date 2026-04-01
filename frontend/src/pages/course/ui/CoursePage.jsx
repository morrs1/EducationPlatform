import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router";
import { selectIsLogged, openLoginModal } from "../../../features/auth";
import {
  enrollInCourse,
  selectCanViewCourseContent,
  selectViewerCourseById,
  toggleFavouriteCourse,
} from "../../../features/viewer";
import CourseTabs from "../../../widgets/course-tabs/ui/CourseTabs";
import CourseSidebar from "../../../widgets/course-sidebar/ui/CourseSidebar";
import CourseDescriptionTab from "../../../widgets/course-description/ui/CourseDescriptionTab";
import CourseContentTab from "../../../widgets/course-content/ui/CourseContentTab";
import CourseReviewsTab from "../../../widgets/course-reviews/ui/CourseReviewsTab";
import { getCoursePageData } from "../lib/getCoursePageData";
import { getCourseDescriptionMarkdown } from "../lib/getCourseDescriptionMarkdown";
import { parseCourseDescriptionMarkdown } from "../lib/parseCourseDescriptionMarkdown";

const tabIds = ["description", "content", "reviews"];

function resolveActiveTab(searchParams) {
  const tab = searchParams.get("tab");
  return tabIds.includes(tab) ? tab : "description";
}

function CoursePage() {
  const { courseId: courseIdParam } = useParams();
  const numericCourseId = Number(courseIdParam);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const isLogged = useSelector(selectIsLogged);
  const viewerCourse = useSelector((state) =>
    Number.isFinite(numericCourseId)
      ? selectViewerCourseById(state, numericCourseId)
      : null,
  );
  const canViewContent = useSelector((state) =>
    Number.isFinite(numericCourseId)
      ? selectCanViewCourseContent(state, numericCourseId)
      : false,
  );

  const [descriptionStatus, setDescriptionStatus] = useState("loading");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");
  const [descriptionRequestSeed, setDescriptionRequestSeed] = useState(0);

  const pageData = useMemo(
    () => getCoursePageData(numericCourseId),
    [numericCourseId],
  );
  const course = viewerCourse ?? pageData?.course ?? null;
  const activeTab = resolveActiveTab(searchParams);

  useEffect(() => {
    if (!course) {
      setDescriptionStatus("error");
      setDescriptionMarkdown("");
      return;
    }

    let isCancelled = false;

    async function loadDescription() {
      setDescriptionStatus("loading");

      try {
        const markdown = await getCourseDescriptionMarkdown(course.id);

        if (!isCancelled) {
          setDescriptionMarkdown(markdown);
          setDescriptionStatus("success");
        }
      } catch {
        if (!isCancelled) {
          setDescriptionMarkdown("");
          setDescriptionStatus("error");
        }
      }
    }

    loadDescription();

    return () => {
      isCancelled = true;
    };
  }, [course?.id, descriptionRequestSeed]);

  const descriptionBlocks = useMemo(
    () => parseCourseDescriptionMarkdown(descriptionMarkdown),
    [descriptionMarkdown],
  );

  if (!pageData || !course) {
    return (
      <div className="course-page">
        <section className="course-not-found">
          <p className="course-not-found-label">Ошибка навигации</p>
          <h1 className="course-not-found-title">Курс не найден</h1>
          <p className="course-not-found-text">
            Возможно, ссылка устарела или курс был удален из демо-данных.
          </p>
        </section>
      </div>
    );
  }

  function changeTab(tabId) {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (tabId === "description") {
      nextSearchParams.delete("tab");
    } else {
      nextSearchParams.set("tab", tabId);
    }

    setSearchParams(nextSearchParams);
  }

  function handlePrimaryAction() {
    if (!isLogged) {
      dispatch(openLoginModal());
      return;
    }

    if (!canViewContent) {
      dispatch(enrollInCourse(course.id));
    }

    changeTab("content");
  }

  function handleToggleFavourite() {
    if (!isLogged) {
      dispatch(openLoginModal());
      return;
    }

    dispatch(toggleFavouriteCourse(course.id));
  }

  function handleDescriptionRetry() {
    setDescriptionRequestSeed((value) => value + 1);
  }

  const tabs = [
    { id: "description", label: "Описание", isLocked: false },
    { id: "content", label: "Содержание", isLocked: !canViewContent },
    { id: "reviews", label: "Отзывы", isLocked: false },
  ];

  return (
    <div className="course-page">
      <aside className="course-page-nav-rail">
        <CourseTabs tabs={tabs} activeTab={activeTab} onTabChange={changeTab} />
      </aside>

      <div className="course-page-main">
        <section className="course-hero">
          <div className="course-hero-copy">
            <p className="course-hero-eyebrow">
              {course.categoryName} / {course.subcategoryName}
            </p>
            <h1 className="course-hero-title">{course.title}</h1>
            <p className="course-hero-description">{course.shortDescription}</p>
          </div>

          <div className="course-hero-meta">
            <span>Автор: {course.authorName}</span>
            <span>Рейтинг {course.rating}</span>
            <span>{course.studentsCount} студентов</span>
          </div>
        </section>

        {activeTab === "description" ? (
          <CourseDescriptionTab
            status={descriptionStatus}
            blocks={descriptionBlocks}
            onRetry={handleDescriptionRetry}
          />
        ) : null}

        {activeTab === "content" ? (
          <CourseContentTab
            course={course}
            syllabus={pageData.syllabus}
            isLogged={isLogged}
            canViewContent={canViewContent}
            onLogin={() => dispatch(openLoginModal())}
            onEnroll={handlePrimaryAction}
          />
        ) : null}

        {activeTab === "reviews" ? (
          <CourseReviewsTab reviews={pageData.reviews} />
        ) : null}
      </div>

      <aside className="course-page-sidebar-rail">
        <CourseSidebar
          course={course}
          isLogged={isLogged}
          onPrimaryAction={handlePrimaryAction}
          onToggleFavourite={handleToggleFavourite}
        />
      </aside>
    </div>
  );
}

export default CoursePage;
