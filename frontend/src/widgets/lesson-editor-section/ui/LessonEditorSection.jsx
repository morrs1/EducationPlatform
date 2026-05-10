import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router";

import {
  mapReadLessonByIdResponseToLessonEditorData,
  requestLessonById,
  requestUploadLessonAsset,
  requestUploadLessonContent,
} from "../../../entities/course";
import {
  buildEditorSnapshot,
  buildLessonContentPayload,
  deriveAssetTypeFromFile,
  getEditorStateFromLesson,
  getLessonValidationError,
} from "../model/lessonEditorModel";
import LessonEditorWorkspace from "./LessonEditorWorkspace";

function LessonEditorSection() {
  const {
    courseId,
    course,
    pageStatus,
    pageError,
    reloadCourse,
    activeLesson,
    activeModule,
  } = useOutletContext();
  const [editorStatus, setEditorStatus] = useState("idle");
  const [editorError, setEditorError] = useState("");
  const [editorLesson, setEditorLesson] = useState(null);
  const [markdownValue, setMarkdownValue] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [reloadSeed, setReloadSeed] = useState(0);
  const [saveState, setSaveState] = useState("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [coverUploadState, setCoverUploadState] = useState("idle");
  const [coverUploadMessage, setCoverUploadMessage] = useState("");
  const [assetUploadState, setAssetUploadState] = useState("idle");
  const [assetUploadMessage, setAssetUploadMessage] = useState("");
  const [localCoverPreviewUrl, setLocalCoverPreviewUrl] = useState("");
  const localCoverPreviewUrlRef = useRef("");

  useEffect(() => {
    localCoverPreviewUrlRef.current = localCoverPreviewUrl;
  }, [localCoverPreviewUrl]);

  useEffect(() => {
    return () => {
      if (localCoverPreviewUrlRef.current) {
        URL.revokeObjectURL(localCoverPreviewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadEditorLesson() {
      if (!activeLesson?.id) {
        if (!isCancelled) {
          setEditorStatus("idle");
          setEditorError("");
          setEditorLesson(null);
          setMarkdownValue("");
          setQuizQuestions([]);
          setSavedSnapshot("");
        }
        return;
      }

      setEditorStatus("loading");
      setEditorError("");
      setSaveState("idle");
      setSaveMessage("");
      setAssetUploadMessage("");
      setCoverUploadMessage("");

      try {
        const lessonResponse = await requestLessonById(activeLesson.id);
        const nextEditorLesson = mapReadLessonByIdResponseToLessonEditorData({
          courseId,
          lessonId: activeLesson.id,
          module: activeModule,
          lessonPreview: activeLesson,
          lessonResponse,
        });
        const nextState = getEditorStateFromLesson(nextEditorLesson);

        if (!isCancelled) {
          setEditorLesson(nextEditorLesson);
          setMarkdownValue(nextState.markdownValue);
          setQuizQuestions(nextState.quizQuestions);
          setSavedSnapshot(nextState.snapshot);
          setEditorStatus("success");
          setEditorError("");

          if (localCoverPreviewUrlRef.current) {
            URL.revokeObjectURL(localCoverPreviewUrlRef.current);
            localCoverPreviewUrlRef.current = "";
            setLocalCoverPreviewUrl("");
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setEditorStatus("error");
          setEditorError(
            error?.message ?? "Не удалось загрузить материалы урока.",
          );
          setEditorLesson(null);
        }
      }
    }

    loadEditorLesson();

    return () => {
      isCancelled = true;
    };
  }, [activeLesson, activeModule, courseId, reloadSeed]);

  const currentSnapshot = useMemo(() => {
    if (!editorLesson) {
      return "";
    }

    return buildEditorSnapshot(editorLesson.type, {
      markdownValue,
      quizQuestions,
      codingState: editorLesson.coding,
    });
  }, [editorLesson, markdownValue, quizQuestions]);

  const hasUnsavedChanges =
    editorStatus === "success" &&
    Boolean(editorLesson) &&
    currentSnapshot !== savedSnapshot;

  async function refreshEditorLessonWithBackendMessages(successMessage) {
    if (!activeLesson?.id) {
      return;
    }

    const lessonResponse = await requestLessonById(activeLesson.id);
    const nextEditorLesson = mapReadLessonByIdResponseToLessonEditorData({
      courseId,
      lessonId: activeLesson.id,
      module: activeModule,
      lessonPreview: activeLesson,
      lessonResponse,
    });
    const nextState = getEditorStateFromLesson(nextEditorLesson);

    setEditorLesson(nextEditorLesson);
    setMarkdownValue(nextState.markdownValue);
    setQuizQuestions(nextState.quizQuestions);
    setSavedSnapshot(nextState.snapshot);
    setEditorStatus("success");
    setEditorError("");

    if (localCoverPreviewUrlRef.current) {
      URL.revokeObjectURL(localCoverPreviewUrlRef.current);
      localCoverPreviewUrlRef.current = "";
      setLocalCoverPreviewUrl("");
    }

    if (successMessage) {
      setSaveMessage(successMessage);
    }
  }

  async function handleSave() {
    if (!editorLesson) {
      return;
    }

    const validationError = getLessonValidationError(editorLesson.type, {
      markdownValue,
      quizQuestions,
    });

    if (validationError) {
      setSaveState("error");
      setSaveMessage(validationError);
      return;
    }

    setSaveState("saving");
    setSaveMessage("");

    try {
      const content = buildLessonContentPayload(editorLesson.type, {
        markdownValue,
        quizQuestions,
        codingState: editorLesson.coding,
      });

      await requestUploadLessonContent(editorLesson.id, { content });
      await refreshEditorLessonWithBackendMessages(
        "Содержимое урока сохранено.",
      );
      setSaveState("success");
    } catch (error) {
      setSaveState("error");
      setSaveMessage(
        error?.message ?? "Не удалось сохранить содержимое урока.",
      );
    }
  }

  async function handleUploadCover(file) {
    if (!editorLesson) {
      return;
    }

    if (localCoverPreviewUrl) {
      URL.revokeObjectURL(localCoverPreviewUrl);
    }

    setLocalCoverPreviewUrl(URL.createObjectURL(file));
    setCoverUploadState("uploading");
    setCoverUploadMessage("");

    try {
      await requestUploadLessonAsset(editorLesson.id, {
        file,
        title: `${editorLesson.title} — обложка`,
        assetType: "cover",
      });
      await refreshEditorLessonWithBackendMessages("");
      setCoverUploadState("success");
      setCoverUploadMessage("Обложка урока загружена.");
    } catch (error) {
      setCoverUploadState("error");
      setCoverUploadMessage(
        error?.message ?? "Не удалось загрузить обложку урока.",
      );
    }
  }

  async function handleUploadAssets(files) {
    if (!editorLesson || !files.length) {
      return;
    }

    setAssetUploadState("uploading");
    setAssetUploadMessage("");

    try {
      await Promise.all(
        files.map((file) =>
          requestUploadLessonAsset(editorLesson.id, {
            file,
            title: file.name,
            assetType: deriveAssetTypeFromFile(file),
          }),
        ),
      );
      await refreshEditorLessonWithBackendMessages("");
      setAssetUploadState("success");
      setAssetUploadMessage(
        files.length === 1
          ? "Материал добавлен к уроку."
          : `К уроку добавлено ${files.length} материалов.`,
      );
    } catch (error) {
      setAssetUploadState("error");
      setAssetUploadMessage(
        error?.message ?? "Не удалось загрузить материалы урока.",
      );
    }
  }

  return (
    <section className="lesson-editor-section">
      {pageStatus === "loading" ? (
        <div className="lesson-editor-empty-state">
          <strong className="lesson-editor-empty-title">
            Загружаем редактор урока
          </strong>
          <p className="lesson-editor-empty-text">
            Подготавливаем структуру курса и список уроков.
          </p>
        </div>
      ) : pageStatus === "error" ? (
        <div className="lesson-editor-empty-state">
          <strong className="lesson-editor-empty-title">
            Не удалось открыть редактор урока
          </strong>
          <p className="lesson-editor-empty-text">
            {pageError || "Курс не загрузился для редактора уроков."}
          </p>
          <button
            type="button"
            className="lesson-editor-primary-action"
            onClick={reloadCourse}
          >
            Повторить запрос
          </button>
        </div>
      ) : !activeLesson ? (
        <div className="lesson-editor-empty-state">
          <strong className="lesson-editor-empty-title">Урок не найден</strong>
          <p className="lesson-editor-empty-text">
            Возможно, этот урок ещё не появился в структуре курса. Вернитесь к
            содержанию и выберите другой урок.
          </p>
        </div>
      ) : editorStatus === "loading" ? (
        <div className="lesson-editor-empty-state">
          <strong className="lesson-editor-empty-title">
            Загружаем материалы урока
          </strong>
          <p className="lesson-editor-empty-text">
            Подготавливаем содержимое, материалы и настройки урока.
          </p>
        </div>
      ) : editorStatus === "error" || !editorLesson ? (
        <div className="lesson-editor-empty-state">
          <strong className="lesson-editor-empty-title">
            Не удалось открыть урок
          </strong>
          <p className="lesson-editor-empty-text">
            {editorError || "Не удалось получить данные урока."}
          </p>
          <button
            type="button"
            className="lesson-editor-primary-action"
            onClick={() => setReloadSeed((value) => value + 1)}
          >
            Повторить запрос
          </button>
        </div>
      ) : (
        <LessonEditorWorkspace
          key={editorLesson.id}
          course={course}
          courseId={courseId}
          activeModule={activeModule}
          editorLesson={editorLesson}
          markdownValue={markdownValue}
          onMarkdownChange={setMarkdownValue}
          quizQuestions={quizQuestions}
          onQuizQuestionsChange={setQuizQuestions}
          onSave={handleSave}
          onRefresh={() => setReloadSeed((value) => value + 1)}
          onUploadCover={handleUploadCover}
          onUploadAssets={handleUploadAssets}
          saveState={saveState}
          saveMessage={saveMessage}
          coverUploadState={coverUploadState}
          coverUploadMessage={coverUploadMessage}
          assetUploadState={assetUploadState}
          assetUploadMessage={assetUploadMessage}
          hasUnsavedChanges={hasUnsavedChanges}
          localCoverPreviewUrl={localCoverPreviewUrl}
        />
      )}
    </section>
  );
}

export default LessonEditorSection;
