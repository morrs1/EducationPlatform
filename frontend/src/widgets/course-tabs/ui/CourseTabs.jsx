function CourseTabs({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="course-tabs" aria-label="Навигация по странице курса">
      <div className="course-tabs-header">
        <p className="course-tabs-label">Разделы курса</p>
        <h2 className="course-tabs-title">Навигация</h2>
      </div>

      <div className="course-tabs-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`course-tab-btn ${activeTab === tab.id ? "active" : ""} ${tab.isLocked ? "locked" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.isLocked ? (
              <span className="course-tab-badge">Закрыт</span>
            ) : null}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default CourseTabs;
