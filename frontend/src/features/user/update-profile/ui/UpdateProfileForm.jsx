import { useEffect, useRef, useState } from "react";

const avatarInputId = "profile-avatar-upload";

function UpdateProfileForm({ viewer, onSubmit }) {
  const [previewSrc, setPreviewSrc] = useState(viewer.avatarUrl);
  const [selectedFileName, setSelectedFileName] = useState("Файл не выбран");
  const [formState, setFormState] = useState({
    firstName: viewer.firstName ?? "",
    lastName: viewer.lastName ?? "",
    patronymic: viewer.patronymic ?? "",
    status: viewer.status ?? viewer.headline ?? "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setPreviewSrc(viewer.avatarUrl);
    setFormState({
      firstName: viewer.firstName ?? "",
      lastName: viewer.lastName ?? "",
      patronymic: viewer.patronymic ?? "",
      status: viewer.status ?? viewer.headline ?? "",
    });
    setAvatarFile(null);
    setSelectedFileName("Файл не выбран");
  }, [viewer]);

  function clearFeedback() {
    setSubmitError(null);
    setSubmitSuccess(null);
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    clearFeedback();

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const nextObjectUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextObjectUrl;

    setPreviewSrc(nextObjectUrl);
    setAvatarFile(file);
    setSelectedFileName(file.name);
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;

    clearFeedback();
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const result = await onSubmit({
      ...formState,
      avatarFile,
    });

    if (!result?.ok) {
      setSubmitError(result?.error ?? "Не удалось сохранить изменения.");
      setIsSubmitting(false);
      return;
    }

    setSubmitSuccess(result.message ?? "Изменения сохранены.");
    setIsSubmitting(false);
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="settings-avatar-picker">
        <img
          src={previewSrc}
          alt="Предпросмотр фото профиля"
          className="settings-avatar-preview"
        />

        <div className="settings-avatar-picker-body">
          <div className="settings-avatar-picker-text">
            <span className="settings-label">Фото профиля</span>
            <p className="settings-helper-text">
              Фото загрузится в S3 через user_service, а после сохранения в
              профиле появится ссылка, которую вернет backend.
            </p>
          </div>

          <input
            id={avatarInputId}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="settings-file-input-hidden"
            onChange={handleAvatarChange}
          />

          <span className="settings-file-name">{selectedFileName}</span>

          <label htmlFor={avatarInputId} className="settings-file-trigger">
            Выбрать файл
          </label>
        </div>
      </div>

      <div className="settings-form-grid">
        <label className="settings-field">
          <span className="settings-label">Имя</span>
          <input
            type="text"
            className="settings-input"
            name="firstName"
            placeholder="Введите имя"
            value={formState.firstName}
            onChange={handleFieldChange}
          />
        </label>

        <label className="settings-field">
          <span className="settings-label">Фамилия</span>
          <input
            type="text"
            className="settings-input"
            name="lastName"
            placeholder="Введите фамилию"
            value={formState.lastName}
            onChange={handleFieldChange}
          />
        </label>

        <label className="settings-field">
          <span className="settings-label">Отчество</span>
          <input
            type="text"
            className="settings-input"
            name="patronymic"
            placeholder="Введите отчество"
            value={formState.patronymic}
            onChange={handleFieldChange}
          />
        </label>
      </div>

      <label className="settings-field">
        <span className="settings-label">Статус</span>
        <input
          type="text"
          className="settings-input"
          name="status"
          placeholder="Например: STUDENT"
          value={formState.status}
          onChange={handleFieldChange}
        />
        <span className="settings-helper-text">
          Используйте латинские заглавные буквы и символы подчеркивания:
          `STUDENT`, `ACTIVE_USER`.
        </span>
      </label>

      {submitError ? <p className="settings-feedback-error">{submitError}</p> : null}
      {submitSuccess ? (
        <p className="settings-feedback-success">{submitSuccess}</p>
      ) : null}

      <div className="settings-actions">
        <button
          type="submit"
          className="settings-submit-btn disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Сохраняем..." : "Сохранить изменения"}
        </button>
      </div>
    </form>
  );
}

export default UpdateProfileForm;
