import { Link } from "react-router";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { CoursePreviewCard } from "../../../entities/course";
import { ProfileActivity, ProfileCard } from "../../../entities/user";
import { selectCurrentViewerId } from "../../../features/auth";
import { selectViewer } from "../../../features/viewer";
import { useAuthorProfileData } from "../../../features/author-profile";
import { resolveRemoteViewerId } from "../../../shared/api";

const TABS = [
  { id: "about", label: "Профиль" },
  { id: "activity", label: "Активность" },
  { id: "teaching", label: "Преподавание" },
];

function AuthorProfileScreen({ userId }) {
  const currentViewerId = useSelector(selectCurrentViewerId);
  const viewer = useSelector(selectViewer);
  const remoteSelfId = useMemo(
    () => resolveRemoteViewerId(currentViewerId, viewer.remoteId),
    [currentViewerId, viewer.remoteId],
  );
  const { status, profile, courses, error } = useAuthorProfileData(userId);
  const [activeTab, setActiveTab] = useState("about");

  const isSelfProfile = useMemo(() => {
    const a = String(userId ?? "").trim();
    const b = String(remoteSelfId ?? "").trim();

    return Boolean(a && b && a === b);
  }, [remoteSelfId, userId]);

  if (status === "invalid") {
    return (
      <section className="author-profile-page">
        <p className="author-profile-error">Некорректная ссылка на профиль.</p>
      </section>
    );
  }

  if (status === "loading" || status === "idle") {
    return (
      <section className="author-profile-page">
        <p className="author-profile-loading">Загружаем профиль…</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="author-profile-page">
        <p className="author-profile-error">{error}</p>
      </section>
    );
  }

  if (status !== "success" || !profile) {
    return null;
  }

  return (
    <section className="author-profile-page">
      {isSelfProfile ? (
        <p className="author-profile-self-hint">
          Это ваш публичный профиль. Личный кабинет:{" "}
          <Link className="author-profile-self-hint-link" to="/account">
            раздел «Аккаунт»
          </Link>
          .
        </p>
      ) : null}

      <nav className="author-profile-tabs" aria-label="Разделы профиля">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`author-profile-tab${activeTab === tab.id ? " is-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "about" ? (
        <div className="author-profile-panel">
          <ProfileCard viewer={profile} />
        </div>
      ) : null}

      {activeTab === "activity" ? (
        <div className="author-profile-panel">
          <ProfileActivity viewerId={userId} />
        </div>
      ) : null}

      {activeTab === "teaching" ? (
        <div className="author-profile-panel author-profile-teaching">
          {courses.length === 0 ? (
            <p className="author-profile-empty">
              Опубликованных курсов пока нет.
            </p>
          ) : (
            <div className="author-profile-course-grid">
              {courses.map((course) => (
                <CoursePreviewCard
                  key={course.id}
                  course={course}
                  viewerCanOpenAuthorProfile
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default AuthorProfileScreen;
