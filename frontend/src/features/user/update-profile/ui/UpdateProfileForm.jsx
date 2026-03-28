import { useEffect, useRef, useState } from "react";

const initialAvatarUrl =
  "https://www.shutterstock.com/image-photo/stylish-black-cat-wearing-sunglasses-260nw-2629842553.jpg";
const avatarInputId = "profile-avatar-upload";

function UpdateProfileForm() {
  const [previewSrc, setPreviewSrc] = useState(initialAvatarUrl);
  const [selectedFileName, setSelectedFileName] = useState("Файл не выбран");
  const objectUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

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
  }

  function handleSubmit(event) {
    event.preventDefault();
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
            placeholder="Введите имя"
            defaultValue="Пупа"
          />
        </label>

        <label className="settings-field">
          <span className="settings-label">Фамилия</span>
          <input
            type="text"
            className="settings-input"
            placeholder="Введите фамилию"
            defaultValue="Залупина"
          />
        </label>
      </div>

      <label className="settings-field">
        <span className="settings-label">О себе</span>
        <textarea
          className="settings-textarea"
          placeholder="Расскажите немного о себе"
          defaultValue="Описание профиля или краткая информация о пользователе."
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
