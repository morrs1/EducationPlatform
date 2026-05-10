function LessonCodingSummary({ coding }) {
  return (
    <section className="lesson-editor-block">
      <div className="lesson-editor-block-head">
        <div>
          <span className="lesson-editor-block-kicker">CODE</span>
          <h2 className="lesson-editor-block-title">Технические настройки</h2>
          <p className="lesson-editor-block-subtext">
            Для кодовых уроков можно настроить текст задания, материалы,
            тесты и язык выполнения.
          </p>
        </div>
      </div>

      <div className="lesson-editor-coding-grid">
        <div className="lesson-editor-info-tile">
          <span className="lesson-editor-info-label">Checker</span>
          <strong className="lesson-editor-info-value">
            {coding?.checkerType || "stdin_stdout"}
          </strong>
        </div>
        <div className="lesson-editor-info-tile">
          <span className="lesson-editor-info-label">Языков</span>
          <strong className="lesson-editor-info-value">
            {coding?.languages?.length ?? 0}
          </strong>
        </div>
        <div className="lesson-editor-info-tile">
          <span className="lesson-editor-info-label">Тест-кейсов</span>
          <strong className="lesson-editor-info-value">
            {coding?.testCases?.length ?? 0}
          </strong>
        </div>
      </div>
    </section>
  );
}

export default LessonCodingSummary;
