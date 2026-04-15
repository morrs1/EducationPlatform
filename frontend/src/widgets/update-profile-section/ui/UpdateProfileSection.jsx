import { useDispatch, useSelector } from "react-redux";
import { UpdateProfileForm } from "../../../features/user/update-profile";
import {
  selectViewer,
  submitViewerProfileUpdate,
} from "../../../features/viewer";

function UpdateProfileSection() {
  const dispatch = useDispatch();
  const viewer = useSelector(selectViewer);

  return (
    <section className="settings-section">
      <header className="settings-section-header">
        <span className="settings-section-label">НАСТРОЙКИ</span>
        <h1 className="settings-section-title">Редактирование профиля</h1>

        <p className="settings-section-description">
          Здесь мы сохраняем имя, фамилию, отчество, статус и фото профиля
          через `user_service`. Email и пароль подключим отдельно позже.
        </p>
      </header>

      <div className="settings-card">
        <UpdateProfileForm
          viewer={viewer}
          onSubmit={(payload) => dispatch(submitViewerProfileUpdate(payload))}
        />
      </div>
    </section>
  );
}

export default UpdateProfileSection;
