import { useEffect, useState } from "react";

function LessonStructureCover({
  title,
  coverUrl,
  size = "default",
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const sizeClass =
    size === "tiny"
      ? " lesson-structure-cover-tiny"
      : size === "compact"
        ? " lesson-structure-cover-compact"
        : "";

  useEffect(() => {
    setHasImageError(false);
  }, [coverUrl]);

  if (coverUrl && !hasImageError) {
    return (
      <div className={`lesson-structure-cover${sizeClass}`}>
        <img
          src={coverUrl}
          alt={`Обложка урока ${title || ""}`.trim()}
          className="lesson-structure-cover-image"
          loading="lazy"
          onError={() => setHasImageError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`lesson-structure-cover${sizeClass}`}>
      <div className="lesson-structure-cover-fallback" aria-hidden="true">
        <span className="lesson-structure-cover-mark">EP</span>
      </div>
    </div>
  );
}

export default LessonStructureCover;
