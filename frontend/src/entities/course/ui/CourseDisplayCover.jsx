function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getCourseInitial(title) {
  const normalizedTitle = normalizeText(title);

  if (!normalizedTitle) {
    return "C";
  }

  return normalizedTitle.charAt(0).toUpperCase();
}

function CourseDisplayCover({
  title,
  imageUrl = "",
  coverUrl = "",
  variant = "card",
}) {
  const resolvedImageUrl = normalizeText(coverUrl) || normalizeText(imageUrl);
  const initial = getCourseInitial(title);

  return (
    <div className={`course-display-cover course-display-cover-${variant}`}>
      {resolvedImageUrl ? (
        <img
          src={resolvedImageUrl}
          alt={`Обложка курса ${title || ""}`.trim()}
          className="course-display-cover-image"
        />
      ) : (
        <div className="course-display-cover-fallback" aria-hidden="true">
          <div className="course-display-cover-orb course-display-cover-orb-a" />
          <div className="course-display-cover-orb course-display-cover-orb-b" />
          <span className="course-display-cover-initial">{initial}</span>
        </div>
      )}
    </div>
  );
}

export default CourseDisplayCover;
