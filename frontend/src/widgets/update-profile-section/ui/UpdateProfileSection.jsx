import { useDispatch, useSelector } from "react-redux";
import { UpdateProfileForm } from "../../../features/user/update-profile";
import {
  selectViewer,
  submitViewerProfileUpdate,
} from "../../../features/viewer";

function UpdateProfileSection() {
  const dispatch = useDispatch();
  const viewer = useSelector(selectViewer);
  const formKey = [
    viewer.id,
    viewer.avatarUrl,
    viewer.firstName,
    viewer.lastName,
    viewer.patronymic,
    viewer.status ?? viewer.headline ?? "",
  ].join(":");

  return (
    <section className="settings-section">
      <header className="settings-section-header">
        <span className="settings-section-label">НАСТРОЙКИ</span>
        <h1 className="settings-section-title">Редактирование профиля</h1>
      </header>

      <div className="settings-card">
        <UpdateProfileForm
          key={formKey}
          viewer={viewer}
          onSubmit={(payload) => dispatch(submitViewerProfileUpdate(payload))}
        />
      </div>
    </section>
  );
}

export default UpdateProfileSection;
