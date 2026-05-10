import { useRef } from "react";
import { Link } from "react-router";

import {
  formatDateTimeLabel,
  getInitials,
  getLessonTypeLabel,
} from "../model/lessonEditorModel";
import LessonAssetsManager from "./LessonAssetsManager";
import LessonCodingSummary from "./LessonCodingSummary";
import LessonQuizBuilder from "./LessonQuizBuilder";
import MarkdownEditor from "./MarkdownEditor";

function LessonEditorWorkspace({
  course,
  courseId,
  activeModule,
  editorLesson,
  markdownValue,
  onMarkdownChange,
  quizQuestions,
  onQuizQuestionsChange,
  onSave,
  onRefresh,
  onUploadCover,
  onUploadAssets,
  saveState,
  saveMessage,
  coverUploadState,
  coverUploadMessage,
  assetUploadState,
  assetUploadMessage,
  hasUnsavedChanges,
  localCoverPreviewUrl,
}) {
  const coverInputRef = useRef(null);
  const coverSource =
    localCoverPreviewUrl || editorLesson.coverAsset?.url || "";
  const titleInitials = getInitials(editorLesson.title);

  function handleCoverSelected(event) {
    const file = event.target.files?.[0];

    if (file) {
      onUploadCover(file);
    }

    event.target.value = "";
  }

  return (
    <>
      <header className="lesson-editor-hero">
        <div className="lesson-editor-hero-copy">
          <span className="lesson-editor-kicker">РЕДАКТОР УРОКА</span>
          <h1 className="lesson-editor-title">Настройки урока</h1>
          <p className="lesson-editor-description">
            {course?.title || "Курс"} · {activeModule?.title || "Модуль"} ·{" "}
            {getLessonTypeLabel(editorLesson.type)}
          </p>
        </div>

        <div className="lesson-editor-hero-actions">
          <Link
            to={`/courses/${courseId}/lessons/${editorLesson.id}`}
            className="lesson-editor-secondary-action"
          >
            Открыть урок
          </Link>

          <button
            type="button"
            className="lesson-editor-secondary-action"
            onClick={onRefresh}
            disabled={saveState === "saving"}
          >
            Обновить
          </button>

          <button
            type="button"
            className="lesson-editor-primary-action"
            onClick={onSave}
            disabled={saveState === "saving" || !hasUnsavedChanges}
          >
            {saveState === "saving"
              ? "Сохраняем..."
              : hasUnsavedChanges
                ? "Сохранить урок"
                : "Сохранено"}
          </button>
        </div>
      </header>

      {saveMessage ? (
        <p
          className={`course-inline-feedback${saveState === "error" ? " error" : ""}`}
        >
          {saveMessage}
        </p>
      ) : null}

      <section className="lesson-editor-top-card">
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleCoverSelected}
        />

        <button
          type="button"
          className="lesson-editor-cover-trigger"
          onClick={() => coverInputRef.current?.click()}
          disabled={coverUploadState === "uploading"}
        >
          {coverSource ? (
            <img
              src={coverSource}
              alt="Обложка урока"
              className="lesson-editor-cover-image"
            />
          ) : (
            <span className="lesson-editor-cover-placeholder">
              {titleInitials}
            </span>
          )}
          <span className="lesson-editor-cover-overlay">
            {coverUploadState === "uploading"
              ? "Загружаем..."
              : "Сменить обложку"}
          </span>
        </button>

        <div className="lesson-editor-top-fields">
          <div className="lesson-editor-title-row">
            <input
              type="text"
              value={editorLesson.title}
              readOnly
              className="lesson-editor-title-input is-readonly"
            />
          </div>

          <div className="lesson-editor-top-meta">
            <span className="lesson-editor-meta-pill">
              {getLessonTypeLabel(editorLesson.type)}
            </span>
            <span className="lesson-editor-meta-pill">
              {editorLesson.durationLabel}
            </span>
            {editorLesson.isPreview ? (
              <span className="lesson-editor-meta-pill">Превью-урок</span>
            ) : null}
            <span className="lesson-editor-meta-pill">
              Обновлено: {formatDateTimeLabel(editorLesson.updatedAt)}
            </span>
          </div>

          {coverUploadMessage ? (
            <p
              className={`course-inline-feedback${coverUploadState === "error" ? " error" : ""}`}
            >
              {coverUploadMessage}
            </p>
          ) : null}
        </div>
      </section>

      <section className="lesson-editor-block">
        <div className="lesson-editor-block-head">
          <div>
            <span className="lesson-editor-block-kicker">СОДЕРЖАНИЕ</span>
            <h2 className="lesson-editor-block-title">
              {editorLesson.type === "quiz"
                ? "Текст тестового урока"
                : "Текст урока"}
            </h2>
          </div>
        </div>

        <MarkdownEditor
          value={markdownValue}
          onChange={onMarkdownChange}
          disabled={saveState === "saving"}
        />
      </section>

      <LessonAssetsManager
        assets={editorLesson.assets}
        onUploadFiles={onUploadAssets}
        uploadState={assetUploadState}
        uploadMessage={assetUploadMessage}
        disabled={saveState === "saving"}
      />

      {editorLesson.type === "quiz" ? (
        <LessonQuizBuilder
          questions={quizQuestions}
          onChange={onQuizQuestionsChange}
        />
      ) : null}

      {editorLesson.type === "coding" ? (
        <LessonCodingSummary coding={editorLesson.coding} />
      ) : null}
    </>
  );
}

export default LessonEditorWorkspace;
