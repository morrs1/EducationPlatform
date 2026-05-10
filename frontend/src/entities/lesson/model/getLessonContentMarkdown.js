const markdownModules = import.meta.glob("../content/**/*.md", {
  query: "?raw",
  import: "default",
});
const markdownContentCache = new Map();
const markdownRequestCache = new Map();

function getMarkdownModulePath(lesson) {
  return lesson?.contentRef ? `../content/${lesson.contentRef}` : "";
}

export function getCachedLessonContentMarkdown(lesson) {
  if (!lesson) {
    return "";
  }

  if (
    typeof lesson.contentMarkdown === "string" &&
    lesson.contentMarkdown.trim()
  ) {
    return lesson.contentMarkdown;
  }

  const modulePath = getMarkdownModulePath(lesson);

  if (!modulePath) {
    return "";
  }

  return markdownContentCache.get(modulePath) ?? "";
}

export async function getLessonContentMarkdown(lesson) {
  if (!lesson) {
    throw new Error("Lesson is not defined");
  }

  if (typeof lesson.contentMarkdown === "string" && lesson.contentMarkdown.trim()) {
    return lesson.contentMarkdown;
  }

  if (!lesson.contentRef) {
    throw new Error(`Content for lesson "${lesson.id}" not found`);
  }

  const modulePath = getMarkdownModulePath(lesson);
  const loadMarkdown = markdownModules[modulePath];

  if (!loadMarkdown) {
    throw new Error(`Markdown module "${modulePath}" not found`);
  }

  const cachedMarkdown = markdownContentCache.get(modulePath);

  if (cachedMarkdown) {
    return cachedMarkdown;
  }

  const cachedRequest = markdownRequestCache.get(modulePath);

  if (cachedRequest) {
    return cachedRequest;
  }

  const requestPromise = loadMarkdown()
    .then((markdown) => {
      markdownContentCache.set(modulePath, markdown);
      markdownRequestCache.delete(modulePath);

      return markdown;
    })
    .catch((error) => {
      markdownRequestCache.delete(modulePath);
      throw error;
    });

  markdownRequestCache.set(modulePath, requestPromise);

  return requestPromise;
}
