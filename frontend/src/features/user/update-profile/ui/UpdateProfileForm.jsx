import { useEffect, useRef, useState } from "react";

const avatarInputId = "profile-avatar-upload";

function UpdateProfileForm({ viewer, onSubmit }) {
  const [previewSrc, setPreviewSrc] = useState(viewer.avatarUrl);
  const [selectedFileName, setSelectedFileName] = useState("Файл не выбран");
  const [formState, setFormState] = useState({
    firstName: viewer.firstName ?? "",
    lastName: viewer.lastName ?? "",
    about: viewer.about ?? "",
  });
  const objectUrlRef = useRef(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setPreviewSrc(viewer.avatarUrl);
    setFormState({
      firstName: viewer.firstName ?? "",
      lastName: viewer.lastName ?? "",
      about: viewer.about ?? "",
    });
    setAvatarDataUrl(null);
    setSelectedFileName("Файл не выбран");
  }, [viewer]);

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const nextObjectUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextObjectUrl;

    setPreviewSrc(nextObjectUrl);
    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...formState,
      avatarUrl: avatarDataUrl,
    });
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
              Выберите изображение с компьютера. После выбора мы покажем превью.
            </p>
          </div>

          <input
            id={avatarInputId}
            type="file"
            accept="image/*"
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
      </div>

      <label className="settings-field">
        <span className="settings-label">О себе</span>
        <textarea
          className="settings-textarea"
          name="about"
          placeholder="Расскажите немного о себе"
          value={formState.about}
          onChange={handleFieldChange}
          rows={5}
        />
      </label>

      <div className="settings-actions">
        <button type="submit" className="settings-submit-btn">
          Сохранить изменения
        </button>
      </div>
    </form>
  );
}

export default UpdateProfileForm;
