export function LessonSubmissionResult({ submission }) {
  if (!submission) {
    return null;
  }

  return (
    <div
      className={`lesson-submission-result ${
        submission.status === "correct" ? "correct" : "incorrect"
      }`}
    >
      <p className="lesson-submission-feedback">{submission.feedback}</p>
      <div className="lesson-submission-meta-list">
        <p className="lesson-submission-meta">
          Баллы: {submission.score}/{submission.maxScore}
        </p>
        <p className="lesson-submission-meta">
          Попытка: {submission.attemptCount}
        </p>
        {typeof submission.passedCases === "number" &&
        typeof submission.totalCases === "number" ? (
          <p className="lesson-submission-meta">
            Ответы: {submission.passedCases}/{submission.totalCases}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function LessonCaseList({ cases, title }) {
  if (!cases?.length) {
    return null;
  }

  return (
    <div className="lesson-result-cases-wrap">
      <p className="lesson-result-cases-title">{title}</p>
      <div className="lesson-result-cases">
        {cases.map((testCase) => (
          <div
            key={`${title}-${testCase.index}`}
            className={`lesson-result-case ${testCase.status}`}
          >
            <div className="lesson-result-case-head">
              <span className="lesson-result-case-index">
                Тест {testCase.index}
              </span>
              <span className="lesson-result-case-status">
                {testCase.status === "passed"
                  ? "Пройден"
                  : testCase.status === "failed"
                    ? "Ошибка"
                    : "Не запущен"}
              </span>
            </div>

            <p className="lesson-result-case-message">{testCase.message}</p>

            <div className="lesson-result-case-grid">
              <div className="lesson-result-case-block">
                <span className="lesson-result-case-label">Ввод</span>
                <pre>{testCase.input || "—"}</pre>
              </div>

              <div className="lesson-result-case-block">
                <span className="lesson-result-case-label">Ожидаемый вывод</span>
                <pre>{testCase.expectedOutput || "—"}</pre>
              </div>

              <div className="lesson-result-case-block">
                <span className="lesson-result-case-label">Фактический вывод</span>
                <pre>{testCase.actualOutput || "—"}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
