import { useRef } from "react";

import { getAssetTypeLabel } from "../model/lessonEditorModel";

function LessonAssetsManager({
  assets,
  onUploadFiles,
  uploadState,
  uploadMessage,
  disabled = false,
}) {
  const fileInputRef = useRef(null);

  function handleFilesSelected(event) {
    const nextFiles = Array.from(event.target.files ?? []);

    if (nextFiles.length) {
      onUploadFiles(nextFiles);
    }

    event.target.value = "";
  }

  return (
    <section className="lesson-editor-block">
      <div className="lesson-editor-block-head">
        <div>
          <span className="lesson-editor-block-kicker">ФАЙЛЫ</span>
          <h2 className="lesson-editor-block-title">Материалы урока</h2>
        </div>

        <button
          type="button"
          className="lesson-editor-secondary-action"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploadState === "uploading"}
        >
          {uploadState === "uploading" ? "Загружаем..." : "Добавить файлы"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleFilesSelected}
      />

      {uploadMessage ? (
        <p
          className={`course-inline-feedback${uploadState === "error" ? " error" : ""}`}
        >
          {uploadMessage}
        </p>
      ) : null}

      {assets.length ? (
        <div className="lesson-editor-asset-list">
          {assets.map((asset) => (
            <article key={asset.id} className="lesson-editor-asset-card">
              <div className="lesson-editor-asset-copy">
                <div className="lesson-editor-asset-head">
                  <strong className="lesson-editor-asset-name">
                    {asset.title}
                  </strong>
                  <span className="lesson-editor-asset-badge">
                    {getAssetTypeLabel(asset.assetType)}
                  </span>
                </div>
                <span className="lesson-editor-asset-meta">
                  {asset.originalFilename || asset.title}
                  {asset.mimeType ? ` · ${asset.mimeType}` : ""}
                </span>
              </div>

              {asset.isResolved ? (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="lesson-editor-asset-open-link"
                >
                  Открыть
                </a>
              ) : (
                <span className="lesson-editor-asset-meta">
                  Ссылка пока не определилась
                </span>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="lesson-editor-empty-panel">
          <strong className="lesson-editor-empty-panel-title">
            Пока без файлов
          </strong>
          <p className="lesson-editor-empty-panel-text">
            Можно прикрепить изображения, видео, PDF и любые дополнительные
            материалы. Они появятся в уроке после загрузки.
          </p>
        </div>
      )}
    </section>
  );
}

export default LessonAssetsManager;
