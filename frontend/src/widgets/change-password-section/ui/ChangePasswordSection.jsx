import { ChangePasswordForm } from "../../../features/user/change-password";

function ChangePasswordSection() {
  return (
    <section className="settings-section">
      <header className="settings-section-header">
        <span className="settings-section-label">БЕЗОПАСНОСТЬ</span>
        <h1 className="settings-section-title">Смена пароля</h1>

        <p className="settings-section-description">
          Обновите пароль для входа в аккаунт. Используйте надежную комбинацию,
          которую не применяете на других сайтах.
        </p>
      </header>

      <div className="settings-card">
        <ChangePasswordForm />
      </div>
    </section>
  );
}

export default ChangePasswordSection;
