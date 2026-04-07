function normalizeSearchQuery(value) {
  return value?.trim().toLowerCase() ?? "";
}

export function filterCoursesByQuery(courses, query) {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return courses;
  }

  return courses.filter((course) => {
    const searchableText = [
      course.title,
      course.authorName,
      course.categoryName,
      course.subcategoryName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
