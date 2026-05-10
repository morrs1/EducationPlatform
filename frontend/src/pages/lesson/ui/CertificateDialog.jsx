import { createPortal } from "react-dom";
import { Link } from "react-router";

function CertificateDialog({ dialog, onClose }) {
  if (!dialog || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="certificate-success-dialog-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-dialog-title"
    >
      <button
        type="button"
        className="certificate-success-dialog-backdrop"
        aria-label="Закрыть окно"
        onClick={onClose}
      />
      <div className="certificate-success-dialog-panel">
        <div
          className={`certificate-success-dialog-card ${
            dialog.variant === "error" ? "is-error" : ""
          }`}
        >
          <button
            type="button"
            className="certificate-success-dialog-x"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
          <div className="certificate-success-dialog-icon" aria-hidden>
            {dialog.variant === "success" ? "🏅" : "⚠️"}
          </div>
          <h2
            id="certificate-dialog-title"
            className="certificate-success-dialog-title"
          >
            {dialog.variant === "success"
              ? "Сертификат готов"
              : "Не получилось оформить"}
          </h2>
          {dialog.variant === "success" ? (
            <p className="certificate-success-dialog-body">
              PDF со сведениями о курсе можно скачать в аккаунте: раздел{" "}
              <strong>Сертификаты</strong> — кнопка «Скачать PDF» напротив
              этого курса.
            </p>
          ) : (
            <p className="certificate-success-dialog-body">{dialog.message}</p>
          )}
          <div className="certificate-success-dialog-actions">
            {dialog.variant === "success" ? (
              <Link
                to="/account/certificates"
                className="course-primary-btn certificate-success-dialog-primary"
                onClick={onClose}
              >
                Перейти к сертификатам
              </Link>
            ) : null}
            <button
              type="button"
              className="course-inline-btn"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default CertificateDialog;
