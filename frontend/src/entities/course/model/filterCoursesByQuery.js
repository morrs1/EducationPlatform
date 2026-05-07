function normalizeSearchQuery(value) {
  return value?.trim().toLowerCase() ?? "";
}

export function filterCoursesByQuery(courses, query) {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return courses;
  }

  return courses.filter((course) => {
    const tagText = Array.isArray(course?.tags)
      ? course.tags.join(" ")
      : "";
    const searchableText = [
      course.title,
      course.authorName,
      tagText,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
