import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { selectCurrentViewerId } from "../../../features/auth";
import {
  createViewerCourseSnapshot,
  resolveCourseServiceAuthorId,
  selectViewer,
  selectViewerName,
  upsertViewerCourseSnapshot,
} from "../../../features/viewer";
import {
  enrichCoursePageDataWithAuthorName,
  mapReadCourseByIdResponseToCoursePageData,
  requestCourseById,
  requestCourseCreation,
} from "../../../entities/course";

const initialFormState = {
  title: "",
  shortDescription: "",
  description: "",
  difficulty: "beginner",
  languageCode: "ru",
  estimatedMinutes: "0",
};

function collectSyllabusLessonIds(modules) {
  return modules.flatMap((module) =>
    module.lessons.map((lesson) => lesson.lessonId).filter(Boolean),
  );
}

function CreateCourseSection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentViewerId = useSelector(selectCurrentViewerId);
  const viewer = useSelector(selectViewer);
  const viewerName = useSelector(selectViewerName);
  const [formState, setFormState] = useState(initialFormState);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");

  const courseServiceAuthorId = useMemo(
    () => resolveCourseServiceAuthorId(currentViewerId, viewer.remoteId),
    [currentViewerId, viewer.remoteId],
  );

  function updateField(field, value) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextTitle = formState.title.trim();
    const nextShortDescription = formState.shortDescription.trim();
    const nextDescription = formState.description.trim();

    if (!nextTitle) {
      setSubmitError("Введите название курса.");
      return;
    }

    if (!nextShortDescription) {
      setSubmitError("Добавьте короткое описание курса.");
      return;
    }

    if (!nextDescription) {
      setSubmitError("Добавьте полное описание курса.");
      return;
    }

    setSubmitStatus("loading");
    setSubmitError("");

    try {
      const courseId = await requestCourseCreation({
        authorId: courseServiceAuthorId,
        courseTitle: nextTitle,
        shortDescription: nextShortDescription,
        description: nextDescription,
        courseDifficulty: formState.difficulty,
        languageCode: formState.languageCode.trim().toLowerCase() || "ru",
        estimatedMinutes: Math.max(
          0,
          Number.parseInt(formState.estimatedMinutes, 10) || 0,
        ),
        tags: [],
      });

      try {
        const response = await requestCourseById(courseId);
        const pageData = await enrichCoursePageDataWithAuthorName(
          mapReadCourseByIdResponseToCoursePageData(
            response,
            courseId,
          ),
        );
        const syllabusLessonIds = collectSyllabusLessonIds(
          pageData.syllabus.modules,
        );

        dispatch(
          upsertViewerCourseSnapshot(
            createViewerCourseSnapshot(
              {
                ...pageData.course,
                authorName: viewerName || pageData.course.authorName,
              },
              syllabusLessonIds,
            ),
          ),
        );
      } catch (snapshotError) {
        void snapshotError;
      }

      setSubmitStatus("success");
      navigate(`/course/${courseId}/syllabus`);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitError(
        error?.message ?? "Не удалось создать курс.",
      );
    }
  }

  return (
    <section className="create-course-section">
      <div className="create-course-section-head">
        <span className="create-course-section-kicker">НОВЫЙ КУРС</span>
        <h1 className="create-course-section-title">Создание курса</h1>
      </div>

      <form className="create-course-section-form" onSubmit={handleSubmit}>
        <label className="create-course-section-field">
          <span className="create-course-section-label">Название курса</span>
          <input
            type="text"
            value={formState.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Введите название курса"
            className="create-course-section-input"
          />
        </label>

        <label className="create-course-section-field">
          <span className="create-course-section-label">Короткое описание</span>
          <textarea
            value={formState.shortDescription}
            onChange={(event) =>
              updateField("shortDescription", event.target.value)
            }
            placeholder="Кратко опишите, для кого этот курс и что он даст."
            className="create-course-section-textarea"
            rows="3"
          />
        </label>

        <label className="create-course-section-field">
          <span className="create-course-section-label">Описание курса</span>
          <textarea
            value={formState.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Опишите программу, результат и ключевые темы."
            className="create-course-section-textarea create-course-section-textarea-lg"
            rows="6"
          />
        </label>

        <div className="create-course-section-grid">
          <label className="create-course-section-field">
            <span className="create-course-section-label">Сложность</span>
            <select
              value={formState.difficulty}
              onChange={(event) =>
                updateField("difficulty", event.target.value)
              }
              className="create-course-section-input"
            >
              <option value="beginner">Начальный уровень</option>
              <option value="intermediate">Средний уровень</option>
              <option value="advanced">Продвинутый уровень</option>
            </select>
          </label>

          <label className="create-course-section-field">
            <span className="create-course-section-label">Язык курса</span>
            <input
              type="text"
              value={formState.languageCode}
              onChange={(event) =>
                updateField("languageCode", event.target.value)
              }
              placeholder="ru"
              className="create-course-section-input"
            />
          </label>

          <label className="create-course-section-field">
            <span className="create-course-section-label">
              Длительность, минут
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={formState.estimatedMinutes}
              onChange={(event) =>
                updateField("estimatedMinutes", event.target.value)
              }
              placeholder="0"
              className="create-course-section-input"
            />
          </label>
        </div>

        <div className="create-course-section-meta">
          <span className="create-course-section-author">
            Автор курса: {viewerName || "текущий преподаватель"}
          </span>
          <span className="create-course-section-author-id">
            authorId: {courseServiceAuthorId}
          </span>
        </div>

        {submitError ? (
          <p className="course-inline-feedback error">{submitError}</p>
        ) : null}

        <button
          type="submit"
          className="create-course-section-submit"
          disabled={submitStatus === "loading"}
        >
          {submitStatus === "loading" ? "Создаём курс..." : "Создать курс"}
        </button>
      </form>
    </section>
  );
}

export default CreateCourseSection;
