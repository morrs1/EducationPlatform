function ProfileCard({ viewer }) {
  const hasHeadline = Boolean(viewer.headline);
  const hasAbout = Boolean(viewer.about);

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

          <p className="profile-card-description">
            {hasHeadline ? <strong>{viewer.headline}</strong> : null}
            {hasHeadline && hasAbout ? " " : null}
            {hasAbout ? viewer.about : null}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
