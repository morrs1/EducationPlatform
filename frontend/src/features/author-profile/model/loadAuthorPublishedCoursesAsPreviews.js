import {
  enrichCoursePageDataWithAuthorName,
  mapPageDataCourseToPreview,
  mapReadCourseByIdResponseToCoursePageData,
  requestPublishedCoursesByAuthor,
} from "../../../entities/course";
import { normalizeText } from "../../../shared/lib/gatewayValues";

function readCourseIdFromListItem(response) {
  const raw = response?.id;

  if (raw == null) {
    return "";
  }

  return normalizeText(typeof raw === "string" ? raw : String(raw));
}

export async function loadAuthorPublishedCoursesAsPreviews(authorId) {
  const responses = await requestPublishedCoursesByAuthor(
    normalizeText(authorId),
  );
  const previews = [];

  for (const response of responses) {
    const courseId = readCourseIdFromListItem(response);
    const pageData = mapReadCourseByIdResponseToCoursePageData(
      response,
      courseId,
    );
    const enriched = await enrichCoursePageDataWithAuthorName(pageData);
    const mapped = mapPageDataCourseToPreview(enriched?.course);

    if (mapped) {
      previews.push(mapped);
    }
  }

  return previews;
}
