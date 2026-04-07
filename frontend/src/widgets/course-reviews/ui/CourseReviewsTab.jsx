function formatReviewDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function renderStars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function CourseReviewsTab({ reviews }) {
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <section className="course-panel">
      <div className="course-panel-header">
        <div>
          <p className="course-panel-label">Отзывы студентов</p>
          <h2 className="course-panel-title">Что говорят о курсе</h2>
        </div>

        <p className="course-panel-description">
          Средняя оценка: {averageRating} из 5 на основе {reviews.length}{" "}
          отзывов.
        </p>
      </div>

      <div className="course-reviews-list">
        {reviews.map((review) => (
          <article key={review.id} className="course-review-card">
            <div className="course-review-head">
              <div className="course-review-author">
                <img
                  src={review.authorAvatarUrl}
                  alt={review.authorName}
                  className="course-review-avatar"
                />

                <div className="course-review-author-meta">
                  <strong className="course-review-author-name">
                    {review.authorName}
                  </strong>
                  <span className="course-review-author-role">
                    {review.authorHeadline}
                  </span>
                </div>
              </div>

              <div className="course-review-rating-wrap">
                <span className="course-review-rating-stars">
                  {renderStars(review.rating)}
                </span>
                <span className="course-review-date">
                  {formatReviewDate(review.createdAt)}
                </span>
              </div>
            </div>

            <p className="course-review-text">{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CourseReviewsTab;
