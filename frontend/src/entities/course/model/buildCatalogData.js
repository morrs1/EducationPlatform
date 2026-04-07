export function buildCatalogData(courses) {
  const categoriesMap = new Map();

  for (const course of courses) {
    if (!categoriesMap.has(course.categoryId)) {
      categoriesMap.set(course.categoryId, {
        id: course.categoryId,
        name: course.categoryName,
        icon: course.categoryIcon,
        subcategoriesMap: new Map(),
      });
    }

    const category = categoriesMap.get(course.categoryId);

    if (!category.subcategoriesMap.has(course.subcategoryId)) {
      category.subcategoriesMap.set(course.subcategoryId, {
        id: course.subcategoryId,
        name: course.subcategoryName,
        courses: [],
      });
    }

    const subcategory = category.subcategoriesMap.get(course.subcategoryId);

    subcategory.courses.push({
      id: course.id,
      title: course.title,
      level: course.level,
      duration: course.durationLabel,
      rating: course.rating,
      students: course.studentsCount,
    });
  }

  return Array.from(categoriesMap.values()).map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
    subcategories: Array.from(category.subcategoriesMap.values()),
  }));
}
