const REGISTER_AVATAR_INPUT_ID = "register-avatar-upload";

function AuthModalForm({
  error,
  form,
  isBusy,
  onSubmit,
  view,
}) {
  const isLoginView = view === "login";

  return (
    <form onSubmit={onSubmit}>
      {isLoginView ? (
        <div className="auth-modal-grid">
          <input
            type="email"
            placeholder="Email"
            className="auth-modal-input"
            value={form.login.email}
            onChange={(event) => form.login.setEmail(event.target.value)}
            disabled={isBusy}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            className="auth-modal-input"
            value={form.login.password}
            onChange={(event) => form.login.setPassword(event.target.value)}
            disabled={isBusy}
            required
          />
          {error ? (
            <span className="auth-modal-feedback error">{error}</span>
          ) : null}
        </div>
      ) : (
        <div className="auth-modal-grid">
          <input
            type="text"
            placeholder="Фамилия Имя Отчество"
            className="auth-modal-input"
            value={form.register.name}
            onChange={(event) => form.register.setName(event.target.value)}
            disabled={isBusy}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="auth-modal-input"
            value={form.register.email}
            onChange={(event) => form.register.setEmail(event.target.value)}
            disabled={isBusy}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            className="auth-modal-input"
            value={form.register.password}
            onChange={(event) => form.register.setPassword(event.target.value)}
            disabled={isBusy}
            required
          />

          <textarea
            placeholder="Статус в профиле, коротко о себе. Например: Ищу первую стажировку в веб-разработке"
            className="auth-modal-input auth-modal-textarea"
            value={form.register.status}
            onChange={(event) => form.register.setStatus(event.target.value)}
            disabled={isBusy}
            rows={3}
          />

          <div className="auth-modal-avatar-picker">
            <div className="auth-modal-avatar-row">
              <div className="auth-modal-avatar-preview">
                {form.register.avatarPreviewSrc ? (
                  <img
                    src={form.register.avatarPreviewSrc}
                    alt="Предпросмотр фото профиля"
                    className="auth-modal-avatar-image"
                  />
                ) : (
                  <div className="auth-modal-avatar-empty">Фото</div>
                )}
              </div>

              <div className="auth-modal-avatar-copy">
                <p className="auth-modal-avatar-title">Фото профиля</p>
                <p className="auth-modal-avatar-hint">
                  Необязательно. Можно выбрать изображение с устройства и сразу
                  увидеть превью.
                </p>
                <p className="auth-modal-avatar-name">
                  {form.register.avatarFileName}
                </p>

                <input
                  id={REGISTER_AVATAR_INPUT_ID}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isBusy}
                  onChange={form.register.handleAvatarChange}
                />

                <label
                  htmlFor={REGISTER_AVATAR_INPUT_ID}
                  className="auth-modal-avatar-trigger"
                >
                  Выбрать фото
                </label>
              </div>
            </div>
          </div>

          {error ? (
            <span className="auth-modal-feedback error">{error}</span>
          ) : null}
        </div>
      )}

      <div className="auth-modal-actions">
        <button type="submit" className="auth-modal-submit" disabled={isBusy}>
          {isBusy
            ? "Подождите…"
            : isLoginView
              ? "Войти"
              : "Зарегистрироваться"}
        </button>
      </div>
    </form>
  );
}

export default AuthModalForm;
