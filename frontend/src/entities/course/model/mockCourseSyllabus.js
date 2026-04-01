import { getCourseById } from "./selectors";

const specificSyllabusByCourseId = {
  2003: {
    courseId: 2003,
    modules: [
      {
        id: "git-foundation",
        title: "База Git и локальный workflow",
        summary: "Разбираемся с репозиториями, коммитами и историей проекта.",
        lessons: [
          { id: "git-1", title: "Как устроен Git и зачем он нужен", durationLabel: "12 мин" },
          { id: "git-2", title: "Создаем репозиторий и первые коммиты", durationLabel: "16 мин" },
          { id: "git-3", title: "Смотрим историю и откатываем изменения", durationLabel: "14 мин" },
        ],
      },
      {
        id: "git-branching",
        title: "Ветки и командная работа",
        summary: "Учимся вести параллельную разработку и не бояться merge-conflict.",
        lessons: [
          { id: "git-4", title: "Ветки, merge и rebase без паники", durationLabel: "19 мин" },
          { id: "git-5", title: "Pull request и понятные сообщения коммитов", durationLabel: "13 мин" },
          { id: "git-6", title: "Практика: собираем чистую историю ветки", durationLabel: "21 мин" },
        ],
      },
      {
        id: "git-release",
        title: "Релизы и восстановление после ошибок",
        summary: "От тэгов и hotfix до безопасного восстановления рабочего состояния.",
        lessons: [
          { id: "git-7", title: "Теги, релизы и changelog", durationLabel: "11 мин" },
          { id: "git-8", title: "Stash, cherry-pick и рабочие сценарии", durationLabel: "15 мин" },
          { id: "git-9", title: "Финальная практика на учебном проекте", durationLabel: "24 мин" },
        ],
      },
    ],
  },
  3003: {
    courseId: 3003,
    modules: [
      {
        id: "react-core",
        title: "Базовые концепции React",
        summary: "JSX, компоненты, props и первая композиция интерфейса.",
        lessons: [
          { id: "react-1", title: "Почему React и как он устроен", durationLabel: "14 мин" },
          { id: "react-2", title: "JSX и декларативное мышление", durationLabel: "17 мин" },
          { id: "react-3", title: "Компоненты, props и UI-композиция", durationLabel: "18 мин" },
          { id: "react-4", title: "Практика: собираем учебную витрину", durationLabel: "26 мин" },
        ],
      },
      {
        id: "react-state",
        title: "Состояние и события",
        summary: "Управляем формами, UI-сценариями и локальным состоянием.",
        lessons: [
          { id: "react-5", title: "События и управляемые элементы", durationLabel: "16 мин" },
          { id: "react-6", title: "useState и декомпозиция формы", durationLabel: "19 мин" },
          { id: "react-7", title: "Условный рендер и списки", durationLabel: "15 мин" },
          { id: "react-8", title: "Практика: фильтры и интерактивная доска", durationLabel: "28 мин" },
        ],
      },
      {
        id: "react-effects",
        title: "Асинхронность и работа с эффектами",
        summary: "Учим страницу жить с запросами, загрузками и ошибками.",
        lessons: [
          { id: "react-9", title: "useEffect без типичных ловушек", durationLabel: "20 мин" },
          { id: "react-10", title: "Состояния загрузки и ошибок", durationLabel: "17 мин" },
          { id: "react-11", title: "Практика: mock-driven экран курса", durationLabel: "30 мин" },
        ],
      },
      {
        id: "react-architecture",
        title: "Архитектура и переиспользование",
        summary: "Разделяем responsibility между page, widget, feature и entity.",
        lessons: [
          { id: "react-12", title: "Композиция UI и feature boundaries", durationLabel: "18 мин" },
          { id: "react-13", title: "Работа с роутингом и навигацией", durationLabel: "16 мин" },
          { id: "react-14", title: "Финальный кейс и рефакторинг", durationLabel: "29 мин" },
        ],
      },
    ],
  },
  5003: {
    courseId: 5003,
    modules: [
      {
        id: "py-data-start",
        title: "Подготовка данных и базовые инструменты",
        summary: "Осваиваем Python-стек для анализа данных и читаем первые датасеты.",
        lessons: [
          { id: "py-data-1", title: "Рабочее окружение аналитика", durationLabel: "13 мин" },
          { id: "py-data-2", title: "NumPy и pandas на учебном датасете", durationLabel: "22 мин" },
          { id: "py-data-3", title: "Очистка пропусков и типизация", durationLabel: "20 мин" },
        ],
      },
      {
        id: "py-data-eda",
        title: "Исследовательский анализ",
        summary: "Ищем закономерности, аномалии и опорные инсайты в данных.",
        lessons: [
          { id: "py-data-4", title: "Быстрый EDA и проверка гипотез", durationLabel: "18 мин" },
          { id: "py-data-5", title: "Визуализации для продуктовой команды", durationLabel: "24 мин" },
          { id: "py-data-6", title: "Практика: исследуем поведение пользователей", durationLabel: "31 мин" },
        ],
      },
      {
        id: "py-data-report",
        title: "Интерпретация и презентация результатов",
        summary: "Формулируем выводы так, чтобы ими можно было пользоваться в продукте.",
        lessons: [
          { id: "py-data-7", title: "Метрики, сторителлинг и выводы", durationLabel: "19 мин" },
          { id: "py-data-8", title: "Практика: собираем аналитическую записку", durationLabel: "27 мин" },
        ],
      },
    ],
  },
  15003: {
    courseId: 15003,
    modules: [
      {
        id: "email-base",
        title: "Структура письма и читательский сценарий",
        summary: "Пишем письма, которые понятно ведут читателя к действию.",
        lessons: [
          { id: "email-1", title: "Роль темы, прехедера и первого экрана", durationLabel: "12 мин" },
          { id: "email-2", title: "Аргументация и фокус письма", durationLabel: "16 мин" },
        ],
      },
      {
        id: "email-copy",
        title: "Копирайтинг для email-маркетинга",
        summary: "Тон, структура, призыв к действию и работа с возражениями.",
        lessons: [
          { id: "email-3", title: "CTA, оффер и эмоциональный крючок", durationLabel: "14 мин" },
          { id: "email-4", title: "Практика: собираем цепочку welcome-писем", durationLabel: "23 мин" },
        ],
      },
      {
        id: "email-optimization",
        title: "Тесты и оптимизация результатов",
        summary: "Оцениваем открываемость, клики и постепенно улучшаем письма.",
        lessons: [
          { id: "email-5", title: "A/B-тесты и метрики email-кампаний", durationLabel: "15 мин" },
          { id: "email-6", title: "Финальный разбор хороших и плохих рассылок", durationLabel: "18 мин" },
        ],
      },
    ],
  },
  21002: {
    courseId: 21002,
    modules: [
      {
        id: "eng-speaking-base",
        title: "Разговорная база и ежедневные шаблоны",
        summary: "Снимаем барьер речи и нарабатываем базовые конструкции.",
        lessons: [
          { id: "eng-1", title: "Small talk и знакомство", durationLabel: "11 мин" },
          { id: "eng-2", title: "Повседневные темы и устойчивые шаблоны", durationLabel: "15 мин" },
          { id: "eng-3", title: "Практика: короткие диалоги", durationLabel: "17 мин" },
        ],
      },
      {
        id: "eng-speaking-life",
        title: "Ситуации из жизни и поездок",
        summary: "Разбираем кафе, транспорт, отель и повседневные просьбы.",
        lessons: [
          { id: "eng-4", title: "В кафе, магазине и на улице", durationLabel: "14 мин" },
          { id: "eng-5", title: "Путешествия и навигация", durationLabel: "16 мин" },
          { id: "eng-6", title: "Практика: ролевая беседа с преподавателем", durationLabel: "24 мин" },
        ],
      },
      {
        id: "eng-speaking-work",
        title: "Работа и уверенное выражение мысли",
        summary: "Говорим о себе, задачах, планах и обратной связи.",
        lessons: [
          { id: "eng-7", title: "Обсуждаем опыт и планы", durationLabel: "13 мин" },
          { id: "eng-8", title: "Формулируем мнение и задаем вопросы", durationLabel: "18 мин" },
          { id: "eng-9", title: "Финальная speaking-сессия", durationLabel: "26 мин" },
        ],
      },
    ],
  },
};

const fallbackModuleTitles = [
  "Ориентиры и основа курса",
  "Рабочие инструменты и практика",
  "Прикладные кейсы",
  "Финальный блок и закрепление",
];

function splitLessonsByModule(totalLessons, modulesCount) {
  const counts = Array.from({ length: modulesCount }, () =>
    Math.floor(totalLessons / modulesCount),
  );

  for (let index = 0; index < totalLessons % modulesCount; index += 1) {
    counts[index] += 1;
  }

  return counts;
}

function buildFallbackSyllabus(course) {
  const modulesCount = Math.min(4, Math.max(3, Math.ceil(course.lessonsCount / 8)));
  const lessonDistribution = splitLessonsByModule(course.lessonsCount, modulesCount);

  return {
    courseId: course.id,
    modules: lessonDistribution.map((lessonsCount, moduleIndex) => ({
      id: `${course.id}-module-${moduleIndex + 1}`,
      title:
        fallbackModuleTitles[moduleIndex] ??
        `Модуль ${moduleIndex + 1}`,
      summary: `Погружаемся в направление «${course.subcategoryName}» и доводим ключевые навыки до практического результата.`,
      lessons: Array.from({ length: lessonsCount }, (_, lessonIndex) => ({
        id: `${course.id}-lesson-${moduleIndex + 1}-${lessonIndex + 1}`,
        title: `${course.subcategoryName}: занятие ${lessonIndex + 1}`,
        durationLabel: `${12 + ((course.id + moduleIndex + lessonIndex) % 16)} мин`,
      })),
    })),
  };
}

function normalizeSyllabus(course, syllabus) {
  const totalListedLessons = syllabus.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0,
  );

  if (totalListedLessons >= course.lessonsCount) {
    return syllabus;
  }

  const missingLessonsCount = course.lessonsCount - totalListedLessons;
  const normalizedModules = syllabus.modules.map((module) => ({
    ...module,
    lessons: [...module.lessons],
  }));

  for (let lessonIndex = 0; lessonIndex < missingLessonsCount; lessonIndex += 1) {
    const targetModule = normalizedModules[lessonIndex % normalizedModules.length];

    targetModule.lessons.push({
      id: `${course.id}-extra-lesson-${lessonIndex + 1}`,
      title: `${course.subcategoryName}: дополнительная практика ${lessonIndex + 1}`,
      durationLabel: `${14 + ((course.id + lessonIndex) % 14)} мин`,
    });
  }

  return {
    ...syllabus,
    modules: normalizedModules,
  };
}

export function getCourseSyllabus(courseId) {
  const numericCourseId = Number(courseId);
  const course = getCourseById(numericCourseId);

  if (!course) {
    return null;
  }

  const syllabus =
    specificSyllabusByCourseId[numericCourseId] ?? buildFallbackSyllabus(course);

  return normalizeSyllabus(course, syllabus);
}
