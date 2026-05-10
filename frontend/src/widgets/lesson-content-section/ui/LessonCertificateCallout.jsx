function LessonCertificateCallout({
  hasCertificateAlready,
  isIssuingCertificate,
  onRequestCertificate,
}) {
  return (
    <div className="lesson-certificate-callout">
      <div className="lesson-certificate-callout-inner">
        <span className="lesson-certificate-callout-badge" aria-hidden>
          ✓
        </span>
        <div className="lesson-certificate-callout-copy">
          <p className="lesson-certificate-callout-title">
            Вы завершили все уроки курса
          </p>
          <p className="lesson-certificate-callout-text">
            {hasCertificateAlready
              ? "Сертификат уже оформлен. Ниже можно открыть подсказку, где скачать PDF."
              : "Оформите запись о сертификате в системе и узнайте, где скачать PDF с вашими данными."}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="course-primary-btn lesson-certificate-callout-btn"
        onClick={onRequestCertificate}
        disabled={isIssuingCertificate}
      >
        {isIssuingCertificate
          ? "Оформляем сертификат…"
          : hasCertificateAlready
            ? "Где скачать сертификат"
            : "Получить сертификат"}
      </button>
    </div>
  );
}

export default LessonCertificateCallout;
