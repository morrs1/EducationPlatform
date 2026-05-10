import {
  createQuizOption,
  createQuizQuestion,
} from "../model/lessonEditorModel";

function LessonQuizBuilder({ questions, onChange }) {
  function updateQuestion(questionId, patch) {
    onChange((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              ...patch,
            }
          : question,
      ),
    );
  }

  function removeQuestion(questionId) {
    onChange((currentQuestions) =>
      currentQuestions.filter((question) => question.id !== questionId),
    );
  }

  function addQuestion() {
    onChange((currentQuestions) => [
      ...currentQuestions,
      createQuizQuestion(currentQuestions.length + 1),
    ]);
  }

  function updateOption(questionId, optionId, patch) {
    onChange((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId
                  ? {
                      ...option,
                      ...patch,
                    }
                  : option,
              ),
            }
          : question,
      ),
    );
  }

  function addOption(questionId) {
    onChange((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: [
                ...question.options,
                createQuizOption(`Вариант ${question.options.length + 1}`),
              ],
            }
          : question,
      ),
    );
  }

  function removeOption(questionId, optionId) {
    onChange((currentQuestions) =>
      currentQuestions.map((question) => {
        if (question.id !== questionId || question.options.length <= 2) {
          return question;
        }

        return {
          ...question,
          options: question.options.filter((option) => option.id !== optionId),
        };
      }),
    );
  }

  function moveOption(questionId, optionId, direction) {
    onChange((currentQuestions) =>
      currentQuestions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const optionIndex = question.options.findIndex(
          (option) => option.id === optionId,
        );

        if (optionIndex < 0) {
          return question;
        }

        const nextIndex =
          direction === "up" ? optionIndex - 1 : optionIndex + 1;

        if (nextIndex < 0 || nextIndex >= question.options.length) {
          return question;
        }

        const nextOptions = [...question.options];
        const [movedOption] = nextOptions.splice(optionIndex, 1);
        nextOptions.splice(nextIndex, 0, movedOption);

        return {
          ...question,
          options: nextOptions,
        };
      }),
    );
  }

  function toggleCorrectOption(questionId, optionId) {
    onChange((currentQuestions) =>
      currentQuestions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        if (question.type === "multiple_choice") {
          return {
            ...question,
            options: question.options.map((option) =>
              option.id === optionId
                ? {
                    ...option,
                    isCorrect: !option.isCorrect,
                  }
                : option,
            ),
          };
        }

        return {
          ...question,
          options: question.options.map((option) => ({
            ...option,
            isCorrect: option.id === optionId,
          })),
        };
      }),
    );
  }

  if (!questions.length) {
    return (
      <section className="lesson-editor-block">
        <div className="lesson-editor-block-head">
          <div>
            <span className="lesson-editor-block-kicker">QUIZ</span>
            <h2 className="lesson-editor-block-title">Вопросы теста</h2>
            <p className="lesson-editor-block-subtext">
              У quiz-урока можно сразу собрать список вопросов и отметить
              правильные варианты.
            </p>
          </div>

          <button
            type="button"
            className="lesson-editor-primary-action"
            onClick={addQuestion}
          >
            + Добавить вопрос
          </button>
        </div>

        <div className="lesson-editor-empty-panel">
          <strong className="lesson-editor-empty-panel-title">
            Пока без вопросов
          </strong>
          <p className="lesson-editor-empty-panel-text">
            Добавьте первый вопрос, чтобы собрать структуру тестового урока.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="lesson-editor-block">
      <div className="lesson-editor-block-head">
        <div>
          <span className="lesson-editor-block-kicker">QUIZ</span>
          <h2 className="lesson-editor-block-title">Вопросы теста</h2>
          <p className="lesson-editor-block-subtext">
            Поддерживаем одиночный и множественный выбор. Объяснения после
            неверного ответа пока не используем, как и договаривались.
          </p>
        </div>

        <button
          type="button"
          className="lesson-editor-primary-action"
          onClick={addQuestion}
        >
          + Добавить вопрос
        </button>
      </div>

      <div className="lesson-quiz-question-list">
        {questions.map((question, questionIndex) => (
          <article key={question.id} className="lesson-quiz-question-card">
            <div className="lesson-quiz-question-head">
              <div className="lesson-quiz-question-head-copy">
                <span className="lesson-editor-block-kicker">
                  Вопрос {questionIndex + 1}
                </span>
                <input
                  type="text"
                  value={question.text}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      text: event.target.value,
                    })
                  }
                  className="lesson-editor-input"
                  placeholder={`Текст вопроса ${questionIndex + 1}`}
                />
              </div>

              <button
                type="button"
                className="lesson-editor-secondary-action"
                onClick={() => removeQuestion(question.id)}
              >
                Удалить вопрос
              </button>
            </div>

            <div className="lesson-editor-field">
              <span className="lesson-editor-field-title">
                Количество правильных ответов
              </span>
              <div className="lesson-quiz-mode-toggle">
                <button
                  type="button"
                  className={`lesson-quiz-mode-button${question.type === "single_choice" ? " is-active" : ""}`}
                  onClick={() =>
                    updateQuestion(question.id, {
                      type: "single_choice",
                      options: question.options.map((option, optionIndex) => ({
                        ...option,
                        isCorrect:
                          optionIndex ===
                          question.options.findIndex((item) => item.isCorrect),
                      })),
                    })
                  }
                >
                  Один
                </button>
                <button
                  type="button"
                  className={`lesson-quiz-mode-button${question.type === "multiple_choice" ? " is-active" : ""}`}
                  onClick={() =>
                    updateQuestion(question.id, {
                      type: "multiple_choice",
                    })
                  }
                >
                  Несколько
                </button>
              </div>
            </div>

            <div className="lesson-editor-block-subhead">
              <strong className="lesson-editor-block-subtitle">
                Варианты ответа
              </strong>
              <p className="lesson-editor-block-subtext">
                Отметьте один или несколько правильных вариантов и при
                необходимости перестройте порядок.
              </p>
            </div>

            <div className="lesson-quiz-option-list">
              {question.options.map((option, optionIndex) => (
                <article key={option.id} className="lesson-quiz-option-card">
                  <button
                    type="button"
                    className={`lesson-quiz-option-selector${option.isCorrect ? " is-active" : ""}`}
                    onClick={() => toggleCorrectOption(question.id, option.id)}
                    aria-pressed={option.isCorrect}
                  >
                    {question.type === "multiple_choice" ? "☑" : "◉"}
                  </button>

                  <input
                    type="text"
                    value={option.text}
                    onChange={(event) =>
                      updateOption(question.id, option.id, {
                        text: event.target.value,
                      })
                    }
                    className="lesson-quiz-option-input"
                    placeholder={`Вариант ${optionIndex + 1}`}
                  />

                  <div className="lesson-quiz-option-actions">
                    <button
                      type="button"
                      className="lesson-quiz-option-action"
                      onClick={() => moveOption(question.id, option.id, "up")}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="lesson-quiz-option-action"
                      onClick={() => moveOption(question.id, option.id, "down")}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="lesson-quiz-option-action danger"
                      onClick={() => removeOption(question.id, option.id)}
                    >
                      ✕
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="lesson-editor-secondary-action"
              onClick={() => addOption(question.id)}
            >
              + Добавить вариант ответа
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LessonQuizBuilder;
