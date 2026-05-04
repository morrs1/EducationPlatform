import { useState } from "react";

function LessonStructureCover({
  title,
  coverUrl,
  size = "default",
}) {
  const [failedCoverUrl, setFailedCoverUrl] = useState("");
  const sizeClass =
    size === "tiny"
      ? " lesson-structure-cover-tiny"
      : size === "compact"
        ? " lesson-structure-cover-compact"
        : "";
  const canRenderImage = Boolean(coverUrl) && coverUrl !== failedCoverUrl;

  if (canRenderImage) {
    return (
      <div className={`lesson-structure-cover${sizeClass}`}>
        <img
          src={coverUrl}
          alt={`Обложка урока ${title || ""}`.trim()}
          className="lesson-structure-cover-image"
          loading="lazy"
          onError={() => setFailedCoverUrl(coverUrl)}
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
