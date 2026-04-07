import { useDispatch, useSelector } from "react-redux";
import { ChangeEmailForm } from "../../../features/user/change-email";
import { submitEmailChange } from "../../../features/auth";
import { changeViewerEmail, selectViewerEmail } from "../../../features/viewer";

function ChangeEmailSection() {
  const dispatch = useDispatch();
  const currentEmail = useSelector(selectViewerEmail);

  async function handleSubmit(payload) {
    const result = await dispatch(submitEmailChange(payload));

    if (result.ok) {
      dispatch(changeViewerEmail(result.nextEmail));
    }

    return result;
  }

  return (
    <section className="settings-section">
      <header className="settings-section-header">
        <span className="settings-section-label">КОНТАКТЫ</span>
        <h1 className="settings-section-title">Изменение почты</h1>

        <p className="settings-section-description">
          Укажите новый адрес электронной почты для входа и уведомлений. Для
          подтверждения мы попросим ввести текущий пароль.
        </p>
      </header>

      <div className="settings-card">
        <ChangeEmailForm
          currentEmail={currentEmail}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}

export default ChangeEmailSection;
