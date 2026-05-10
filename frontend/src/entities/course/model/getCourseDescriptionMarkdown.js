import { getCourseById } from "./selectors";

const markdownModules = import.meta.glob("../content/*.md", {
  query: "?raw",
  import: "default",
});

const markdownLoadersByCourseId = {
  2003: markdownModules["../content/2003.md"],
  3003: markdownModules["../content/3003.md"],
  5003: markdownModules["../content/5003.md"],
  15003: markdownModules["../content/15003.md"],
  21002: markdownModules["../content/21002.md"],
};

function buildFallbackMarkdown(course) {
  return `# ${course.title}

${course.shortDescription}

## Для кого этот курс

- Для тех, кто хочет последовательно войти в направление «${course.subcategoryName}»
- Для студентов, которым нужен понятный учебный ритм без перегруза
- Для специалистов, которые хотят быстро перевести теорию в прикладной навык

## Что будет внутри

- ${course.lessonsCount} уроков с постепенным усложнением
- ${course.testsCount} тестов для проверки базовых знаний
- ${course.tasksCount} практических заданий с закреплением результата

## Как построено обучение

Курс собран вокруг коротких учебных блоков, практики и понятных контрольных точек. Сначала вы выстраиваете базу, потом закрепляете ее на задачах, а в финале собираете цельный навык, который можно использовать в реальной работе.`;
}

export async function getCourseDescriptionMarkdown(courseId) {
  const numericCourseId = Number(courseId);
  const course = getCourseById(numericCourseId);

  if (!course) {
    throw new Error("Описание курса недоступно");
  }

  const markdownLoader = markdownLoadersByCourseId[numericCourseId];

  if (markdownLoader) {
    return markdownLoader();
  }

  return buildFallbackMarkdown(course);
}
