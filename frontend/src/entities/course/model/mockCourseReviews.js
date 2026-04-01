import { getCourseById } from "./selectors";
import { mockUsersById } from "../../user/model/mockUsers";

const specificReviewsByCourseId = {
  2003: [
    {
      id: "review-2003-1",
      authorId: "student-1",
      rating: 5,
      text: "Очень спокойный и прикладной курс. После него перестал бояться веток, merge и ситуаций, когда нужно быстро откатиться назад.",
      createdAt: "2026-03-08T10:30:00.000Z",
    },
    {
      id: "review-2003-2",
      authorId: "student-3",
      rating: 4,
      text: "Нравится, что много бытовых сценариев из реальной разработки. Хотелось бы чуть больше задач на конфликтующие изменения.",
      createdAt: "2026-03-11T14:10:00.000Z",
    },
  ],
  3003: [
    {
      id: "review-3003-1",
      authorId: "student-2",
      rating: 5,
      text: "Хороший вход в React: не только компоненты, но и нормальная архитектурная логика по слоям и состоянию.",
      createdAt: "2026-03-19T12:00:00.000Z",
    },
    {
      id: "review-3003-2",
      authorId: "student-4",
      rating: 5,
      text: "Понравилось, что примеры похожи на живое приложение, а не на учебный счетчик. После курса стало легче раскладывать UI по ответственности.",
      createdAt: "2026-03-23T17:45:00.000Z",
    },
    {
      id: "review-3003-3",
      authorId: "student-5",
      rating: 4,
      text: "Темп хороший, но на эффектах пришлось пересмотреть пару уроков. В остальном очень добротная база.",
      createdAt: "2026-03-27T09:15:00.000Z",
    },
  ],
  5003: [
    {
      id: "review-5003-1",
      authorId: "student-1",
      rating: 5,
      text: "Курс сильно помогает тем, кто только входит в аналитику. Много понятных объяснений по pandas и визуализациям.",
      createdAt: "2026-03-14T11:05:00.000Z",
    },
    {
      id: "review-5003-2",
      authorId: "student-3",
      rating: 4,
      text: "Понравился блок про продуктовую интерпретацию результатов. Было бы здорово добавить еще один кейс с сегментацией пользователей.",
      createdAt: "2026-03-22T15:20:00.000Z",
    },
  ],
  15003: [
    {
      id: "review-15003-1",
      authorId: "student-4",
      rating: 5,
      text: "Очень прикладной материал. После курса переписали welcome-цепочку и сразу увидели рост кликов.",
      createdAt: "2026-03-10T08:40:00.000Z",
    },
    {
      id: "review-15003-2",
      authorId: "student-2",
      rating: 4,
      text: "Хороший курс для тех, кто работает с рассылками без сильного копирайтерского бэкграунда.",
      createdAt: "2026-03-18T13:25:00.000Z",
    },
  ],
  21002: [
    {
      id: "review-21002-1",
      authorId: "student-5",
      rating: 5,
      text: "Стало проще говорить без долгих пауз. Понравилось, что много коротких диалогов и бытовых сценариев.",
      createdAt: "2026-03-09T19:00:00.000Z",
    },
    {
      id: "review-21002-2",
      authorId: "student-1",
      rating: 4,
      text: "Полезный курс для размораживания речи. Хотелось бы чуть больше упражнений на работу и созвоны.",
      createdAt: "2026-03-25T16:55:00.000Z",
    },
  ],
};

const fallbackAuthorIds = Object.values(mockUsersById)
  .filter((user) => user.role === "student")
  .map((user) => user.id);

function buildFallbackReviews(course) {
  return Array.from({ length: 3 }, (_, index) => {
    const authorId =
      fallbackAuthorIds[(course.id + index) % fallbackAuthorIds.length];
    const rating = 5 - (index % 2);

    return {
      id: `review-${course.id}-${index + 1}`,
      authorId,
      rating,
      text:
        index === 0
          ? `Курс «${course.title}» дает понятную структуру входа в направление и помогает не потеряться в теме уже на первой неделе.`
          : index === 1
            ? `Особенно полезны практические блоки: видно, как знания из раздела «${course.subcategoryName}» складываются в понятный рабочий навык.`
            : `Подойдет тем, кто хочет спокойно и последовательно освоить «${course.categoryName}» без перегруза лишней теорией.`,
      createdAt: `2026-03-${String(10 + index + (course.id % 8)).padStart(2, "0")}T12:00:00.000Z`,
    };
  });
}

export function getCourseReviews(courseId) {
  const numericCourseId = Number(courseId);
  const course = getCourseById(numericCourseId);

  if (!course) {
    return [];
  }

  return (
    specificReviewsByCourseId[numericCourseId] ?? buildFallbackReviews(course)
  );
}
