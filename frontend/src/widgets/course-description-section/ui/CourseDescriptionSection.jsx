import { useOutletContext } from "react-router";

function getDifficultyLabel(difficulty) {
  if (difficulty === "beginner") {
    return "Начальный уровень";
  }

  if (difficulty === "intermediate") {
    return "Продвинутый уровень";
  }

  return "Уровень пока не указан";
}

function formatDateTime(value) {
  if (!value) {
    return "Пока нет данных";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function CourseDescriptionSection() {
  const { course, pageStatus, pageError, reloadCourse } = useOutletContext();

  if (pageStatus === "loading") {
    return (
      <section className="course-description-section">
        <div className="course-syllabus-empty-state">
          <strong className="course-syllabus-empty-title">
            Загружаем описание курса
          </strong>
          <p className="course-syllabus-empty-text">
            Подготавливаем описание и основные сведения.
          </p>
        </div>
      </section>
    );
  }

  if (pageStatus === "error") {
    return (
      <section className="course-description-section">
        <div className="course-syllabus-empty-state">
          <strong className="course-syllabus-empty-title">
            Не удалось загрузить описание курса
          </strong>
          <p className="course-syllabus-empty-text">
            {pageError || "Не удалось получить описание курса."}
          </p>
          <button
            type="button"
            className="course-syllabus-edit-link"
            onClick={reloadCourse}
          >
            Повторить запрос
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="course-description-section">
      <header className="course-description-section-head">
        <span className="course-builder-section-kicker">ОПИСАНИЕ КУРСА</span>
        <h1 className="course-builder-section-title">
          {course?.title || "Описание курса"}
        </h1>
      </header>

      <div className="course-description-card-grid">
        <article className="course-description-card">
          <strong className="course-description-card-title">
            Основная информация
          </strong>
          <p className="course-description-card-text">
            {course?.shortDescription || "Краткое описание пока не указано."}
          </p>
        </article>

        <article className="course-description-card">
          <strong className="course-description-card-title">
            Параметры курса
          </strong>
          <p className="course-description-card-text">
            {getDifficultyLabel(course?.difficulty)} · {course?.durationLabel}
          </p>
        </article>

        <article className="course-description-card">
          <strong className="course-description-card-title">
            Состояние черновика
          </strong>
          <p className="course-description-card-text">
            Автор: {course?.authorName || "не определён"}
            <br />
            Создан: {formatDateTime(course?.createdAt)}
            <br />
            Обновлён: {formatDateTime(course?.updatedAt)}
          </p>
        </article>
      </div>

      <article className="course-description-card course-description-card-wide">
        <strong className="course-description-card-title">
          Полное описание курса
        </strong>
        <p className="course-description-card-text">
          {course?.description || "Полное описание курса пока не заполнено."}
        </p>
      </article>
    </section>
  );
}

export default CourseDescriptionSection;
