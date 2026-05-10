/* model */
export { buildCatalogData } from "./model/buildCatalogData";
export { filterCoursesByQuery } from "./model/filterCoursesByQuery";
export { getCourseCoverSrc } from "./model/getCourseCoverSrc";
export { getCourseDescriptionMarkdown } from "./model/getCourseDescriptionMarkdown";
export { getCoursePageData } from "./model/getCoursePageData";
export { getCourseProgressByCourseId } from "./model/progress";
export { mockCatalogData } from "./model/mockCatalogData";
export { parseCourseDescriptionMarkdown } from "./model/parseCourseDescriptionMarkdown";
export {
  getMockCourses,
  INCLUDE_MOCK_COURSES_IN_UI,
} from "./model/mockCourses";
export {
  formatCourseTagLabel,
  sanitizeCourseDisplayLabel,
} from "./model/courseDisplayLabels";
export {
  enrichCourse,
  getAllCourses,
  getCourseAuthor,
  getCourseById,
  getCourseCategories,
  getCoursesByCategory,
  getPopularCourses,
  mapCourseToPreview,
} from "./model/selectors";
export { getCourseReviews } from "./model/mockCourseReviews";
export { getCourseSyllabus } from "./model/mockCourseSyllabus";
export { useLessonCoverMap } from "./model/useLessonCoverMap";

/* ui */
export { default as CompletedCourseCard } from "./ui/completed/CompletedCourseCard";
export { default as CompletedCoursesList } from "./ui/completed/CompletedCoursesList";
export { default as CourseDisplayCover } from "./ui/CourseDisplayCover";
export { default as CoursePreviewCard } from "./ui/preview/CoursePreviewCard";
export { default as CurrentCourseCard } from "./ui/current/CurrentCourseCard";
export { default as CurrentCoursesList } from "./ui/current/CurrentCoursesList";
export { default as LessonStructureCover } from "./ui/LessonStructureCover";

/* api: mappers + enrich; HTTP — shared/api/courseServiceClient */
export {
  enrichCoursePageDataWithAuthorName,
  extractLessonCoverAssetFromLessonResponse,
  mapReadCourseByIdResponseToCoursePageData,
  mapReadLessonByIdResponseToLessonEditorData,
  mapReadLessonByIdResponseToLessonPageData,
  requestAddLessonToCourse,
  requestAddModuleToCourse,
  requestAllCourses,
  requestCourseById,
  requestCourseCreation,
  requestDraftCoursesByAuthor,
  requestSearchCourses,
  requestLessonById,
  requestPublishCourse,
  requestPublishedCoursesByAuthor,
  requestUploadLessonAsset,
  requestUploadLessonContent,
} from "./api/courseServiceApi";
