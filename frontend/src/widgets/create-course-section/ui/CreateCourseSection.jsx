import { useNavigate } from "react-router";

const draftCourseId = "course-draft-001";

function CreateCourseSection() {
  const navigate = useNavigate();

  return (
    <section className="create-course-section">
      <div className="create-course-section-head">
        <span className="create-course-section-kicker">НОВЫЙ КУРС</span>
        <h1 className="create-course-section-title">Создание курса</h1>
      </div>

      <label className="create-course-section-field">
        <span className="create-course-section-label">Название курса</span>
        <input
          type="text"
          placeholder="Введите название курса"
          className="create-course-section-input"
        />
      </label>

      <button
        type="button"
        className="create-course-section-submit"
        onClick={() => navigate(`/course/${draftCourseId}/syllabus`)}
      >
        Создать курс
      </button>
    </section>
  );
}

export default CreateCourseSection;
