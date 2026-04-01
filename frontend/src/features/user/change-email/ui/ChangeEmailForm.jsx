import { useEffect, useState } from "react";

function ChangeEmailForm({ currentEmail, onSubmit }) {
  const [nextEmail, setNextEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setNextEmail("");
    setPassword("");
  }, [currentEmail]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(nextEmail);
    setNextEmail("");
    setPassword("");
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="settings-note">
        После сохранения новый адрес можно использовать для входа и получения
        уведомлений.
      </div>

      <div className="settings-current-value">
        <span className="settings-current-value-label">Текущая почта</span>
        <span className="settings-current-value-text">{currentEmail}</span>
      </div>

      <label className="settings-field">
        <span className="settings-label">Новая почта</span>
        <input
          type="email"
          className="settings-input"
          placeholder="Введите новый email"
          value={nextEmail}
          onChange={(event) => setNextEmail(event.target.value)}
        />
      </label>

      <label className="settings-field">
        <span className="settings-label">Пароль для подтверждения</span>
        <input
          type="password"
          className="settings-input"
          placeholder="Введите текущий пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
