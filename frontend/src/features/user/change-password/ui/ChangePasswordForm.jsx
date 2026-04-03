import { useState } from "react";

function ChangePasswordForm({ onSubmit }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      currentPassword,
      nextPassword,
      confirmPassword,
    });

    if (!result?.ok) {
      setSubmitError(result?.error ?? "Не удалось обновить пароль.");
      setIsSubmitting(false);
      return;
    }

    setCurrentPassword("");
    setNextPassword("");
    setConfirmPassword("");
    setSubmitSuccess(result.message ?? "Пароль обновлен.");
    setIsSubmitting(false);
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
          value={currentPassword}
          onChange={(event) => {
            clearFeedback();
            setCurrentPassword(event.target.value);
          }}
        />
      </label>

      <label className="settings-field">
        <span className="settings-label">Новый пароль</span>
        <input
          type="password"
          className="settings-input"
          placeholder="Введите новый пароль"
          value={nextPassword}
          onChange={(event) => {
            clearFeedback();
            setNextPassword(event.target.value);
          }}
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
          value={confirmPassword}
          onChange={(event) => {
            clearFeedback();
            setConfirmPassword(event.target.value);
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
          {isSubmitting ? "Обновляем..." : "Обновить пароль"}
        </button>
      </div>
    </form>
  );
}

export default ChangePasswordForm;
