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
import {
  formatMinutesLabel,
  normalizeLessonBackendType,
} from "./courseServiceMapperUtils";
import { mapQuizEditorQuestion } from "./courseServiceQuizMappers";

export function mapReadLessonByIdResponseToLessonEditorData({
  courseId,
  lessonId,
  module,
  lessonPreview,
  lessonResponse,
}) {
  const lessonContent = normalizeObject(lessonResponse?.content);
  const type = normalizeLessonBackendType(
    normalizeText(lessonResponse?.type) || lessonPreview?.type,
  );
  const assets = mapLessonAssets(lessonResponse?.assets);
  const coverAsset = selectLessonCoverAsset(assets);

  return {
    id: lessonId,
    courseId,
    moduleId: module?.id ?? null,
    moduleTitle: module?.title ?? "Модуль курса",
    title:
      unwrapString(lessonResponse?.title, "title") ||
      lessonPreview?.title ||
      "Урок без названия",
    type,
    position: lessonPreview?.position ?? 1,
    estimatedMinutes: lessonPreview?.estimatedMinutes ?? null,
    durationLabel:
      lessonPreview?.durationLabel ||
      formatMinutesLabel(lessonPreview?.estimatedMinutes),
    isPreview: Boolean(lessonPreview?.isPreview),
    updatedAt: normalizeText(lessonResponse?.updatedAt),
    createdAt: normalizeText(lessonResponse?.createdAt),
    coverAsset,
    assets: assets.filter((asset) => asset.assetType !== "cover"),
    contentMarkdown:
      type === "quiz"
        ? unwrapString(lessonContent?.introMarkdown, "introMarkdown")
        : type === "coding"
          ? unwrapString(lessonContent?.taskMarkdown, "taskMarkdown")
          : unwrapString(lessonContent?.markdown, "markdown"),
    questions:
      type === "quiz"
        ? normalizeArray(lessonContent?.questions).map(mapQuizEditorQuestion)
        : [],
    coding:
      type === "coding"
        ? {
            checkerType:
              unwrapString(lessonContent?.checkerType, "checkerType") ||
              "stdin_stdout",
            languages: normalizeArray(lessonContent?.languages).map((language) => ({
              language: unwrapString(language?.language, "language") || "java",
              starterCode:
                unwrapString(language?.starterCode, "starterCode") || "",
            })),
            testCases: normalizeArray(lessonContent?.testCases).map(
              (testCase, testCaseIndex) => ({
                id: normalizeText(testCase?.id) || crypto.randomUUID(),
                isPublic: unwrapBoolean(testCase?.isPublic, "isPublic"),
                input: unwrapString(testCase?.input, "input"),
                expectedOutput: unwrapString(
                  testCase?.expectedOutput,
                  "expectedOutput",
                ),
                title: `Тест ${testCaseIndex + 1}`,
              }),
            ),
          }
        : null,
  };
}
