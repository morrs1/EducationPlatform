import { useDispatch, useSelector } from "react-redux";
import { UpdateProfileForm } from "../../../features/user/update-profile";
import { selectViewer, updateViewerProfile } from "../../../features/viewer";

function UpdateProfileSection() {
  const dispatch = useDispatch();
  const viewer = useSelector(selectViewer);

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
        <UpdateProfileForm
          viewer={viewer}
          onSubmit={(payload) => dispatch(updateViewerProfile(payload))}
        />
      </div>
    </section>
  );
}

export default UpdateProfileSection;
