import { useEffect, useState } from "react";

function ChangeEmailForm({ currentEmail, onSubmit }) {
  const [nextEmail, setNextEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNextEmail("");
    setPassword("");
  }, [currentEmail]);

  function clearFeedback() {
    setSubmitError(null);
    setSubmitSuccess(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const result = await onSubmit({
      nextEmail,
      currentPassword: password,
    });

    if (!result?.ok) {
      setSubmitError(result?.error ?? "Не удалось изменить почту.");
      setIsSubmitting(false);
      return;
    }

    setNextEmail("");
    setPassword("");
    setSubmitSuccess(result.message ?? "Почта обновлена.");
    setIsSubmitting(false);
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
          onChange={(event) => {
            clearFeedback();
            setNextEmail(event.target.value);
          }}
        />
      </label>

      <label className="settings-field">
        <span className="settings-label">Пароль для подтверждения</span>
        <input
          type="password"
          className="settings-input"
          placeholder="Введите текущий пароль"
          value={password}
          onChange={(event) => {
            clearFeedback();
            setPassword(event.target.value);
          }}
        />
      </label>

      {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
      {submitSuccess ? (
        <p className="text-sm text-green-600">{submitSuccess}</p>
      ) : null}

      <div className="settings-actions">
        <button
          type="submit"
          className="settings-submit-btn disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Сохраняем..." : "Изменить почту"}
        </button>
      </div>
    </form>
  );
}

export default ChangeEmailForm;
