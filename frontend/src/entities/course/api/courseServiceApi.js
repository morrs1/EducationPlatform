import { requestPublicDisplayProfileById } from "../../../shared/api";
import { isUuid, normalizeText } from "./courseServiceCommon";
export {
  requestAddLessonToCourse,
  requestAddModuleToCourse,
  requestAllCourses,
  requestCourseById,
  requestCourseCreation,
  requestDraftCoursesByAuthor,
  requestLessonById,
  requestPublishCourse,
  requestPublishedCoursesByAuthor,
  requestSearchCourses,
  requestUploadLessonAsset,
  requestUploadLessonContent,
} from "../../../shared/api/courseServiceClient";
export {
  extractLessonCoverAssetFromLessonResponse,
  mapReadCourseByIdResponseToCoursePageData,
  mapReadLessonByIdResponseToLessonEditorData,
  mapReadLessonByIdResponseToLessonPageData,
} from "./courseServiceMappers";

/**
 * Подставляет ФИО автора из user service по course.authorId (в ответе course-service есть только id).
 */
export async function enrichCoursePageDataWithAuthorName(pageData) {
  if (!pageData?.course) {
    return pageData;
  }

  const authorId = normalizeText(pageData.course.authorId);
  const existingName = normalizeText(pageData.course.authorName);

  if (existingName) {
    return pageData;
  }

  if (!authorId || !isUuid(authorId)) {
    return pageData;
  }

  try {
    const authorProfile = await requestPublicDisplayProfileById(authorId);
    const name = normalizeText(authorProfile?.name);

    if (!name) {
      return pageData;
    }

    return {
      ...pageData,
      course: {
        ...pageData.course,
        authorName: name,
      },
    };
  } catch {
    return pageData;
  }
}
