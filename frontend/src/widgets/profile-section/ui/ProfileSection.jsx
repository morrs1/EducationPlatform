import { useSelector } from "react-redux";
import { ProfileActivity, ProfileCard } from "../../../entities/user";
import { selectCurrentViewerId, selectIsLogged } from "../../../features/auth";
import { selectViewer } from "../../../features/viewer";
import { resolveRemoteViewerId } from "../../../shared/api";

function ProfileSection() {
  const isLogged = useSelector(selectIsLogged);
  const currentViewerId = useSelector(selectCurrentViewerId);
  const viewer = useSelector(selectViewer);
  const remoteViewerId = isLogged
    ? resolveRemoteViewerId(currentViewerId, viewer.remoteId)
    : null;

  return (
    <section className="profile-section">
      <ProfileCard viewer={viewer} />
      <ProfileActivity viewerId={remoteViewerId} />
    </section>
  );
}

export default ProfileSection;
