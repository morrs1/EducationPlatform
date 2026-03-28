import { UpdateProfileForm } from "../../../features/user/update-profile";

function UpdateProfileSection() {
  return (
    <section className="settings-section">
      <header className="settings-section-header">
        <span className="settings-section-label">НАСТРОЙКИ</span>
        <h1 className="settings-section-title">Редактирование профиля</h1>

        <p className="settings-section-description">
          Обновите основные данные аккаунта, которые будут видеть другие
          пользователи.
        </p>
      </header>

      <div className="settings-card">
        <UpdateProfileForm />
      </div>
    </section>
  );
}

export default UpdateProfileSection;
