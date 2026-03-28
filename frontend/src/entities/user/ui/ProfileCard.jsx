function ProfileCard() {
  return (
    <div className="profile-card">
      <div className="profile-card-content">
        <img
          className="profile-card-image"
          src="https://www.shutterstock.com/image-photo/stylish-black-cat-wearing-sunglasses-260nw-2629842553.jpg"
          alt="Фото профиля"
        />

        <div className="profile-card-body">
          <span className="profile-card-label">ПРОФИЛЬ</span>

          <h1 className="profile-card-title">
            Пупа Залупина
          </h1>

          <p className="profile-card-description">
            Описание профиля или краткая информация о пользователе.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
