function ChangePasswordForm() {
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="settings-note">
        После смены пароля используйте новый пароль для входа на всех ваших
        устройствах.
      </div>

      <label className="settings-field">
        <span className="settings-label">Текущий пароль</span>
        <input
          type="password"
          className="settings-input"
          placeholder="Введите текущий пароль"
        />
      </label>

      <label className="settings-field">
        <span className="settings-label">Новый пароль</span>
        <input
          type="password"
          className="settings-input"
          placeholder="Введите новый пароль"
        />
        <span className="settings-helper-text">
          Желательно использовать не менее 8 символов, включая буквы и цифры.
        </span>
      </label>

      <label className="settings-field">
        <span className="settings-label">Повторите новый пароль</span>
        <input
          type="password"
          className="settings-input"
          placeholder="Повторите новый пароль"
        />
      </label>

      <div className="settings-actions">
        <button type="submit" className="settings-submit-btn">
          Обновить пароль
        </button>
      </div>
    </form>
  );
}

export default ChangePasswordForm;
