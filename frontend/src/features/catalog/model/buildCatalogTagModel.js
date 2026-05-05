const ALL_TAG_KEY = "__all__";

export { ALL_TAG_KEY };

function normalizeTagKey(label) {
  return String(label).trim().toLowerCase().replaceAll("ё", "е");
}

function collectCourseTagLabels(course) {
  const labels = [];
  const raw = course?.tags;

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (typeof entry === "string" && entry.trim()) {
        labels.push(entry.trim());
      } else if (entry?.name && String(entry.name).trim()) {
        labels.push(String(entry.name).trim());
      }
    }
  }

  return labels;
}

function dedupeCourseRows(rows) {
  const seen = new Set();
  const out = [];

  for (const row of rows) {
    if (!row?.id || seen.has(row.id)) {
      continue;
    }
    seen.add(row.id);
    out.push({ id: row.id, title: row.title });
  }

  out.sort((left, right) =>
    String(left.title).localeCompare(String(right.title), "ru"),
  );
  return out;
}

/**
 * @param {Array<object>} courses — курсы с полями id, title и опционально tags / subcategoryName
 * @returns {{ tagList: Array<{ key: string, label: string, count: number }>, coursesByTagKey: Map<string, Array<{ id: unknown, title: string }>>, allCourseRows: Array<{ id: unknown, title: string }> }}
 */
export function buildCatalogTagModel(courses) {
  const keyToLabel = new Map();
  const keyToRows = new Map();

  for (const course of courses) {
    const tagLabels = collectCourseTagLabels(course);
    const seenKeysOnCourse = new Set();

    for (const label of tagLabels) {
      const key = normalizeTagKey(label);
      if (!key || seenKeysOnCourse.has(key)) {
        continue;
      }
      seenKeysOnCourse.add(key);
      if (!keyToLabel.has(key)) {
        keyToLabel.set(key, label);
      }
      if (!keyToRows.has(key)) {
        keyToRows.set(key, []);
      }
      keyToRows.get(key).push({
        id: course.id,
        title: course.title,
      });
    }
  }

  const tagList = Array.from(keyToLabel.entries())
    .map(([key, label]) => ({
      key,
      label,
      count: keyToRows.get(key)?.length ?? 0,
    }))
    .sort((left, right) => left.label.localeCompare(right.label, "ru"));

  const allCourseRows = dedupeCourseRows(
    courses.map((course) => ({ id: course.id, title: course.title })),
  );

  for (const [, rows] of keyToRows) {
    rows.sort((left, right) =>
      String(left.title).localeCompare(String(right.title), "ru"),
    );
  }

  return {
    tagList,
    coursesByTagKey: keyToRows,
    allCourseRows,
  };
}

export function getCatalogCoursesForTagKey(model, tagKey) {
  if (!model) {
    return [];
  }
  if (!tagKey || tagKey === ALL_TAG_KEY) {
    return model.allCourseRows;
  }
  return model.coursesByTagKey.get(tagKey) ?? [];
}
