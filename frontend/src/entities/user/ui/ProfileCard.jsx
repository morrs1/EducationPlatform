function ProfileCard({ viewer }) {
  const viewerStatus = viewer.status || viewer.headline;
  const viewerAbout = viewer.about?.trim() ?? "";

  return (
    <div className="profile-card">
      <div className="profile-card-content">
        <img
          className="profile-card-image"
          src={viewer.avatarUrl}
          alt={`Фото профиля ${viewer.name}`}
        />

        <div className="profile-card-body">
          <span className="profile-card-label">ПРОФИЛЬ</span>

          <h1 className="profile-card-title">{viewer.name}</h1>

          {viewerStatus || viewerAbout ? (
            <p className="profile-card-description">
              {viewerStatus ? <strong>{viewerStatus}</strong> : null}
              {viewerStatus && viewerAbout ? " " : null}
              {viewerAbout || null}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
