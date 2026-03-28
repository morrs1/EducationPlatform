function ChangeEmailForm() {
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="settings-note">
        После сохранения новый адрес можно использовать для входа и получения
        уведомлений.
      </div>

      <div className="settings-current-value">
        <span className="settings-current-value-label">Текущая почта</span>
        <span className="settings-current-value-text">
          pupa.zalupina@example.com
        </span>
      </div>

      <label className="settings-field">
        <span className="settings-label">Новая почта</span>
        <input
          type="email"
          className="settings-input"
          placeholder="Введите новый email"
        />
      </label>

      <label className="settings-field">
        <span className="settings-label">Пароль для подтверждения</span>
        <input
          type="password"
          className="settings-input"
          placeholder="Введите текущий пароль"
        />
      </label>

      <div className="settings-actions">
        <button type="submit" className="settings-submit-btn">
          Изменить почту
        </button>
      </div>
    </form>
  );
}

export default ChangeEmailForm;
