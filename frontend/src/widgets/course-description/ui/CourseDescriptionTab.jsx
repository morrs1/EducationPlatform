function CourseDescriptionTab({ status, blocks, onRetry }) {
  if (status === "loading") {
    return (
      <section className="course-panel">
        <div className="course-panel-loading">Загружаем описание курса...</div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="course-panel">
        <div className="course-panel-error">
          <p>Не удалось загрузить описание курса.</p>
          <button type="button" className="course-inline-btn" onClick={onRetry}>
            Повторить
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="course-panel">
      <div className="course-markdown">
        {blocks.map((block, index) => {
          if (block.type === "heading-1") {
            return (
              <h2 key={`${block.type}-${index}`} className="course-markdown-h1">
                {block.content}
              </h2>
            );
          }

          if (block.type === "heading-2") {
            return (
              <h3 key={`${block.type}-${index}`} className="course-markdown-h2">
                {block.content}
              </h3>
            );
          }

          if (block.type === "list") {
            return (
              <ul
                key={`${block.type}-${index}`}
                className="course-markdown-list"
              >
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          }

          return (
            <p
              key={`${block.type}-${index}`}
              className="course-markdown-paragraph"
            >
              {block.content}
            </p>
          );
        })}
      </div>
    </section>
  );
}

export default CourseDescriptionTab;
