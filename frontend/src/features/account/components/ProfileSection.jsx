function ProfileSection() {
  return (
    <section className="w-full p-4 bg-gray-100 shadow-md rounded-2xl shadow-black/50 md:p-6">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:gap-12">
        <img
          className="object-cover w-24 h-24 shadow-md rounded-2xl shadow-black/50 sm:h-32 sm:w-32 md:h-40 md:w-40"
          src="https://www.shutterstock.com/image-photo/stylish-black-cat-wearing-sunglasses-260nw-2629842553.jpg"
          alt="Фото профиля"
        />

        <div className="flex flex-col items-center min-w-0 gap-5 md:items-start">
          <span className="text-sm font-medium tracking-wide text-gray-500">
            ПРОФИЛЬ
          </span>

          <h1 className="text-2xl font-bold text-center sm:text-3xl md:text-left md:text-4xl lg:text-5xl">
            Пупа Залупина
          </h1>

          <p className="max-w-2xl text-center text-gray-600 md:text-left">
            Описание профиля или краткая информация о пользователе.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ProfileSection;
