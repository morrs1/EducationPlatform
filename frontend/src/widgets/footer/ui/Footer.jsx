function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-brand">
          <span className="site-footer-mark">EP</span>
          <div className="site-footer-copy">
            <strong className="site-footer-title">EduPlatform</strong>
            <p className="site-footer-text">
              Мягкий визуальный ритм, понятные треки и пространство, где учеба
              ощущается собранной, а не перегруженной.
            </p>
          </div>
        </div>

        <div className="site-footer-tags">
          <span className="site-footer-tag">Практика в уроках</span>
          <span className="site-footer-tag">Подбор по уровню</span>
          <span className="site-footer-tag">Прогресс и сертификаты</span>
        </div>

        <div className="site-footer-meta">
          <span>© 2026 Образовательная платформа</span>
          <span>Учитесь в своем темпе.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
