import { useSelector } from "react-redux";
import ProfileCard from "../../../entities/user/ui/ProfileCard";
import ProfileActivity from "../../../entities/user/ui/ProfileActivity";
import { selectCurrentViewerId, selectIsLogged } from "../../../features/auth";
import { resolveRemoteViewerId, selectViewer } from "../../../features/viewer";

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
