function CourseStatsPanel({ course }) {
  const stats = [
    { label: "Уроков", value: course.lessonsCount },
    { label: "Тестов", value: course.testsCount },
    { label: "Задач", value: course.tasksCount },
    { label: "Длительность", value: course.durationLabel },
  ];

  return (
    <section className="course-side-card">
      <div className="course-side-card-header">
        <p className="course-side-card-label">Структура</p>
        <h2 className="course-side-card-title">Что внутри курса</h2>
      </div>

      <div className="course-stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="course-stat-item">
            <span className="course-stat-label">{stat.label}</span>
            <strong className="course-stat-value">{stat.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CourseStatsPanel;
