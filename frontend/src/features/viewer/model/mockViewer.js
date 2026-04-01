function buildAvatarUrl(seed) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;
}

export const mockViewer = {
  id: "viewer-1",
  firstName: "Баграт",
  lastName: "Саркисян",
  name: "Баграт Саркисян",
  email: "bagrat.sarkisyan@example.com",
  headline: "Изучает frontend и продуктовую разработку",
  about:
    "Собирает персональный образовательный трек, тестирует интерфейсы платформы и параллельно закрывает практические задачи по React, JavaScript и продуктовому мышлению.",
  avatarUrl: buildAvatarUrl("Баграт Саркисян"),
  enrolledCourseIds: [3003, 5003, 21002],
  favouriteCourseIds: [3003, 2003, 7004, 21004],
  completedCourseIds: [2003, 15003],
  certificateCourseIds: [2003],
  progressByCourseId: {
    3003: {
      completedLessons: 9,
      completedTests: 3,
      completedTasks: 4,
      lastVisitedAt: "2026-03-29T18:30:00.000Z",
    },
    5003: {
      completedLessons: 6,
      completedTests: 2,
      completedTasks: 2,
      lastVisitedAt: "2026-03-28T20:10:00.000Z",
    },
    21002: {
      completedLessons: 11,
      completedTests: 2,
      completedTasks: 5,
      lastVisitedAt: "2026-03-30T08:45:00.000Z",
    },
    2003: {
      completedLessons: 11,
      completedTests: 3,
      completedTasks: 5,
      lastVisitedAt: "2026-03-18T14:00:00.000Z",
    },
    15003: {
      completedLessons: 10,
      completedTests: 6,
      completedTasks: 8,
      lastVisitedAt: "2026-03-12T11:20:00.000Z",
    },
  },
};
