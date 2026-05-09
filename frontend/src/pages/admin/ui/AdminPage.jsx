import { useMemo, useState } from "react";
import { Link } from "react-router";

import { requestDraftCoursesByAuthor } from "../../../entities/course";
import { isUuid } from "../../../shared/lib";
import {
  requestAssignAdminRole,
  requestAssignAuthorRole,
} from "../../../shared/api";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function AdminPage() {
  const [userIdInput, setUserIdInput] = useState("");
  const [activeUserId, setActiveUserId] = useState("");
  const [actionStatus, setActionStatus] = useState("idle");
  const [actionMessage, setActionMessage] = useState("");
  const [draftsStatus, setDraftsStatus] = useState("idle");
  const [draftsError, setDraftsError] = useState("");
  const [draftCourses, setDraftCourses] = useState([]);

  const normalizedUserIdInput = useMemo(
    () => normalizeText(userIdInput),
    [userIdInput],
  );

  const canSubmitUserId = Boolean(normalizedUserIdInput && isUuid(normalizedUserIdInput));
  const resolvedActiveUserId = activeUserId || (canSubmitUserId ? normalizedUserIdInput : "");

  async function runRoleAction(request) {
    setActionStatus("loading");
    setActionMessage("");

    try {
      const response = await request();
      const message =
        typeof response === "string" && response.trim()
          ? response.trim()
          : "Готово.";
      setActionStatus("success");
      setActionMessage(message);
      return true;
    } catch (error) {
      setActionStatus("error");
      setActionMessage(error?.message ?? "Не удалось выполнить действие.");
      return false;
    }
  }

  async function handleAssignAuthor() {
    if (!canSubmitUserId) {
      setActionStatus("error");
      setActionMessage("Введите корректный UUID пользователя.");
      return;
    }

    setActiveUserId(normalizedUserIdInput);
    await runRoleAction(() => requestAssignAuthorRole(normalizedUserIdInput));
  }

  async function handleAssignAdmin() {
    if (!canSubmitUserId) {
      setActionStatus("error");
      setActionMessage("Введите корректный UUID пользователя.");
      return;
    }

    setActiveUserId(normalizedUserIdInput);
    await runRoleAction(() => requestAssignAdminRole(normalizedUserIdInput));
  }

  async function handleLoadDrafts() {
    if (!canSubmitUserId) {
      setDraftsStatus("error");
      setDraftsError("Введите корректный UUID пользователя.");
      return;
    }

    setActiveUserId(normalizedUserIdInput);
    setDraftsStatus("loading");
    setDraftsError("");

    try {
      const courses = await requestDraftCoursesByAuthor(normalizedUserIdInput);
      setDraftCourses(Array.isArray(courses) ? courses : []);
      setDraftsStatus("success");
    } catch (error) {
      setDraftCourses([]);
      setDraftsStatus("error");
      setDraftsError(error?.message ?? "Не удалось загрузить черновики.");
    }
  }

  return (
    <section className="admin-page">
      <header className="settings-section-header">
        <span className="settings-section-label">АДМИН</span>
        <h1 className="settings-section-title">Админ-панель</h1>
        <p className="settings-section-description">
          Назначайте роли и просматривайте неопубликованные курсы по ID пользователя.
        </p>
      </header>

      <div className="settings-card admin-card">
        <div className="admin-form">
          <label className="settings-field">
            <span className="settings-label">ID пользователя (UUID)</span>
            <input
              value={userIdInput}
              onChange={(event) => setUserIdInput(event.target.value)}
              className="settings-input"
              placeholder="например: 909262ef-d229-47aa-8fdd-8c3f93adfd5d"
              inputMode="text"
              autoComplete="off"
            />
          </label>

          <div className="admin-actions">
            <button
              type="button"
              className="settings-submit-btn"
              disabled={actionStatus === "loading"}
              onClick={handleAssignAuthor}
            >
              Назначить автором
            </button>
            <button
              type="button"
              className="settings-submit-btn"
              disabled={actionStatus === "loading"}
              onClick={handleAssignAdmin}
            >
              Назначить админом
            </button>
            <button
              type="button"
              className="settings-submit-btn admin-secondary-btn"
              disabled={draftsStatus === "loading"}
              onClick={handleLoadDrafts}
            >
              Показать черновики
            </button>
          </div>

          {actionMessage ? (
            <p
              className={
                actionStatus === "error"
                  ? "settings-feedback-error"
                  : "settings-feedback-success"
              }
            >
              {actionMessage}
            </p>
          ) : null}

          {draftsStatus === "error" && draftsError ? (
            <p className="settings-feedback-error">{draftsError}</p>
          ) : null}
        </div>
      </div>

      <div className="settings-card admin-card">
        <div className="admin-drafts-head">
          <h2 className="settings-section-title admin-subtitle">
            Черновики курсов пользователя
          </h2>
          {resolvedActiveUserId ? (
            <span className="admin-muted">userId: {resolvedActiveUserId}</span>
          ) : (
            <span className="admin-muted">Укажите userId выше</span>
          )}
        </div>

        {draftsStatus === "loading" ? (
          <p className="admin-muted">Загружаем черновики…</p>
        ) : null}

        {draftsStatus === "success" ? (
          draftCourses.length ? (
            <div className="admin-drafts-list">
              {draftCourses.map((course) => (
                <div key={course.id} className="admin-draft-row">
                  <div className="admin-draft-copy">
                    <strong className="admin-draft-title">
                      {course.title || "Курс без названия"}
                    </strong>
                    <span className="admin-draft-meta">
                      id: {course.id} · уроков: {course.lessonsCount ?? 0}
                    </span>
                  </div>

                  <div className="admin-draft-actions">
                    <Link className="course-syllabus-edit-link" to={`/courses/${course.id}`}>
                      Открыть
                    </Link>
                    <Link className="course-syllabus-edit-link" to={`/course/${course.id}`}>
                      Редактор
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-muted">Черновиков нет.</p>
          )
        ) : null}
      </div>
    </section>
  );
}

export default AdminPage;
