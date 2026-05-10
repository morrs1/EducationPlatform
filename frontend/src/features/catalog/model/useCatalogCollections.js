import { useEffect, useMemo, useState } from "react";

import { requestViewerDisplayProfileById } from "../../../shared/api";
import {
  buildCatalogData,
  getAllCourses,
  mapReadCourseByIdResponseToCoursePageData,
  requestAllCourses,
} from "../../../entities/course";

import { buildCatalogTagModel } from "./buildCatalogTagModel";

const INFORMATION_TECHNOLOGY_CATEGORY = {
  id: 1,
  name: "Информационные технологии",
  icon: "💻",
};

const PROGRAMMING_SUBCATEGORY = {
  id: 101,
  name: "Языки программирования",
};

const WEB_SUBCATEGORY = {
  id: 103,
  name: "Веб-разработка",
};

const DATA_SUBCATEGORY = {
  id: 104,
  name: "Data Science",
};

const BASICS_SUBCATEGORY = {
  id: 102,
  name: "Основы программирования",
};

function inferBackendSubcategory(course) {
  const searchableText = [
    course?.title,
    course?.shortDescription,
    course?.description,
    course?.categoryName,
    course?.subcategoryName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    /(javascript|typescript|frontend|react|vue|node|web|html|css|js)/.test(
      searchableText,
    )
  ) {
    return WEB_SUBCATEGORY;
  }

  if (/(python|data|pandas|numpy|анализ|аналит)/.test(searchableText)) {
    return DATA_SUBCATEGORY;
  }

  if (/(java|kotlin|program|код|backend|oop|generics)/.test(searchableText)) {
    return PROGRAMMING_SUBCATEGORY;
  }

  return BASICS_SUBCATEGORY;
}

function normalizeBackendCourseTags(course) {
  const raw = course?.tags;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((tag) => {
      if (typeof tag === "string") {
        return tag.trim();
      }
      if (tag && typeof tag.name === "string") {
        return tag.name.trim();
      }
      return "";
    })
    .filter(Boolean);
}

function normalizeBackendCatalogCourse(course, authorNameById) {
  const subcategory = inferBackendSubcategory(course);
  const tags = normalizeBackendCourseTags(course);

  return {
    id: course.id,
    title: course.title,
    authorId: course.authorId,
    authorName:
      authorNameById.get(course.authorId) ||
      course.authorName ||
      "Автор курса",
    categoryId: INFORMATION_TECHNOLOGY_CATEGORY.id,
    categoryName: INFORMATION_TECHNOLOGY_CATEGORY.name,
    categoryIcon: INFORMATION_TECHNOLOGY_CATEGORY.icon,
    subcategoryId: subcategory.id,
    subcategoryName: subcategory.name,
    tags,
    level: course.level || course.difficulty || "beginner",
    durationLabel: course.durationLabel || "Длительность уточняется",
    rating: null,
    studentsCount: null,
    lessonsCount: Number(course.lessonsCount) || 0,
    testsCount: Number(course.testsCount) || 0,
    tasksCount: Number(course.tasksCount) || 0,
    shortDescription:
      course.shortDescription || "Описание курса пока не заполнено.",
    imageUrl: course.coverUrl || course.imageUrl || "",
    coverUrl: course.coverUrl || course.imageUrl || "",
    isPublished: true,
    isDraft: false,
    isBackendCourse: true,
  };
}

function buildCoursesByCategory(courses) {
  return courses.reduce((accumulator, course) => {
    if (!accumulator[course.categoryId]) {
      accumulator[course.categoryId] = [];
    }

    accumulator[course.categoryId].push(course);
    return accumulator;
  }, {});
}

export function useCatalogCollections() {
  const [backendCourses, setBackendCourses] = useState([]);
  const [backendStatus, setBackendStatus] = useState("idle");
  const [backendError, setBackendError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadBackendCourses() {
      setBackendStatus("loading");
      setBackendError("");

      try {
        const response = await requestAllCourses();
        const pageDataList = response
          .map((courseResponse) =>
            mapReadCourseByIdResponseToCoursePageData(courseResponse, ""),
          )
          .filter((pageData) => pageData?.course?.isPublished);
        const uniqueAuthorIds = Array.from(
          new Set(
            pageDataList
              .map((pageData) => pageData?.course?.authorId)
              .filter(Boolean),
          ),
        );
        const authorEntries = await Promise.all(
          uniqueAuthorIds.map(async (authorId) => {
            try {
              const authorProfile = await requestViewerDisplayProfileById(
                authorId,
              );

              return [authorId, authorProfile?.name || ""];
            } catch {
              return [authorId, ""];
            }
          }),
        );
        const authorNameById = new Map(authorEntries);
        const nextBackendCourses = pageDataList
          .map((pageData) =>
            normalizeBackendCatalogCourse(pageData.course, authorNameById),
          )
          .sort((left, right) => left.title.localeCompare(right.title, "ru"));

        if (!isCancelled) {
          setBackendCourses(nextBackendCourses);
          setBackendStatus("success");
        }
      } catch (error) {
        if (!isCancelled) {
          setBackendCourses([]);
          setBackendStatus("error");
          setBackendError(
            error?.message ??
              "Не удалось загрузить курсы для каталога.",
          );
        }
      }
    }

    loadBackendCourses();

    return () => {
      isCancelled = true;
    };
  }, []);

  const allCourses = useMemo(
    () => [...backendCourses, ...getAllCourses()],
    [backendCourses],
  );
  const catalogData = useMemo(() => buildCatalogData(allCourses), [allCourses]);
  const catalogTagModel = useMemo(
    () => buildCatalogTagModel(allCourses),
    [allCourses],
  );
  const courseCategories = useMemo(
    () =>
      catalogData.map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
      })),
    [catalogData],
  );
  const coursesByCategory = useMemo(
    () => buildCoursesByCategory(allCourses),
    [allCourses],
  );

  return {
    allCourses,
    courseCategories,
    coursesByCategory,
    catalogData,
    catalogTagModel,
    backendStatus,
    backendError,
  };
}
