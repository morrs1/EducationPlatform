import { useSelector } from "react-redux";
import ProfileCard from "../../../entities/user/ui/ProfileCard";
import ProfileActivity from "../../../entities/user/ui/ProfileActivity";
import { selectViewer } from "../../../features/viewer";

function ProfileSection() {
  const viewer = useSelector(selectViewer);

  return (
    <section className="profile-section">
      <ProfileCard viewer={viewer} />
      <ProfileActivity />
    </section>
  );
}

export default ProfileSection;
