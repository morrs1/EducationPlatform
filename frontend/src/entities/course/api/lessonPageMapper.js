import {
  normalizeArray,
  normalizeObject,
  normalizeText,
  unwrapBoolean,
  unwrapString,
} from "./courseServiceCommon";
import {
  mapLessonAssets,
  selectLessonCoverAsset,
} from "../../../shared/api/courseServiceMedia";
import { getSyllabusLessonLocation } from "./courseServiceMapperUtils";
import { mapReadCourseByIdResponseToCoursePageData } from "./coursePageMapper";
import { mapQuizQuestion } from "./courseServiceQuizMappers";

function mapBackendLesson({
  courseId,
  lessonId,
  module,
  lessonPreview,
  lessonResponse,
}) {
  const lessonType = normalizeText(lessonResponse?.type).toLowerCase();
  const lessonContent = normalizeObject(lessonResponse?.content);
  const assets = mapLessonAssets(lessonResponse?.assets);
  const coverAsset = selectLessonCoverAsset(assets);
  const lessonAssets = assets.filter((asset) => asset.assetType !== "cover");
  const title =
    unwrapString(lessonResponse?.title, "title") ||
    lessonPreview?.title ||
    "Урок без названия";

  if (lessonType === "coding") {
    const languages = normalizeArray(lessonContent?.languages);
    const primaryLanguage = normalizeObject(languages[0]);
    const testCases = normalizeArray(lessonContent?.testCases);

    return {
      id: lessonId,
      courseId,
      moduleId: module?.id ?? null,
      moduleTitle: module?.title ?? "Модуль курса",
      title,
      position: lessonPreview?.position ?? 1,
      type: "code",
      points: Math.max(testCases.length, 1),
      contentMarkdown:
        unwrapString(lessonContent?.taskMarkdown, "taskMarkdown") ||
        "Задание пока не заполнено.",
      coverAsset,
      assets: lessonAssets,
      grader: {
        language:
          unwrapString(primaryLanguage?.language, "language") || "code",
        starterCode:
          unwrapString(primaryLanguage?.starterCode, "starterCode") || "",
        visibleCases: testCases
          .filter((testCase) => unwrapBoolean(testCase?.isPublic, "isPublic"))
          .map((testCase, index) => ({
            id:
              normalizeText(testCase?.id) ||
              `${lessonId}-visible-case-${index + 1}`,
            input: unwrapString(testCase?.input, "input"),
            expectedOutput: unwrapString(
              testCase?.expectedOutput,
              "expectedOutput",
            ),
          })),
        hiddenCases: testCases
          .filter((testCase) => !unwrapBoolean(testCase?.isPublic, "isPublic"))
          .map((testCase, index) => ({
            id:
              normalizeText(testCase?.id) ||
              `${lessonId}-hidden-case-${index + 1}`,
            input: unwrapString(testCase?.input, "input"),
            expectedOutput: unwrapString(
              testCase?.expectedOutput,
              "expectedOutput",
            ),
          })),
        mockExecution: {
          strategy: "contains",
          requiredSnippets: [],
        },
      },
      isBackendLesson: true,
    };
  }

  if (lessonType === "quiz") {
    const questions = normalizeArray(lessonContent?.questions).map(
      mapQuizQuestion,
    );

    return {
      id: lessonId,
      courseId,
      moduleId: module?.id ?? null,
      moduleTitle: module?.title ?? "Модуль курса",
      title,
      position: lessonPreview?.position ?? 1,
      type: "quiz",
      points: Math.max(questions.length, 1),
      contentMarkdown:
        unwrapString(lessonContent?.introMarkdown, "introMarkdown") ||
        "Вопросы урока пока не заполнены.",
      coverAsset,
      assets: lessonAssets,
      questions,
      isBackendLesson: true,
    };
  }

  return {
    id: lessonId,
    courseId,
    moduleId: module?.id ?? null,
    moduleTitle: module?.title ?? "Модуль курса",
    title,
    position: lessonPreview?.position ?? 1,
    type: "theory",
    points: 0,
    contentMarkdown:
      unwrapString(lessonContent?.markdown, "markdown") ||
      "Содержимое урока пока не заполнено.",
    coverAsset,
    assets: lessonAssets,
    isBackendLesson: true,
  };
}

export function extractLessonCoverAssetFromLessonResponse(lessonResponse) {
  const assets = mapLessonAssets(lessonResponse?.assets);

  return selectLessonCoverAsset(assets);
}

export function mapReadLessonByIdResponseToLessonPageData({
  courseId,
  lessonId,
  courseResponse,
  lessonResponse,
}) {
  const responseCourseId = normalizeText(lessonResponse?.courseId);

  if (responseCourseId && responseCourseId !== courseId) {
    throw new Error("Этот урок не относится к выбранному курсу.");
  }

  const coursePageData = mapReadCourseByIdResponseToCoursePageData(
    courseResponse,
    courseId,
  );
  const { module, lesson: lessonPreview } = getSyllabusLessonLocation(
    coursePageData.syllabus,
    lessonId,
  );

  return {
    course: coursePageData.course,
    syllabus: coursePageData.syllabus,
    lesson: mapBackendLesson({
      courseId,
      lessonId,
      module,
      lessonPreview,
      lessonResponse,
    }),
  };
}
