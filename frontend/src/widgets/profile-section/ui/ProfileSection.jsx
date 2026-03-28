import ProfileCard from "../../../entities/user/ui/ProfileCard";
import ProfileActivity from "../../../entities/user/ui/ProfileActivity";

function ProfileSection() {
  return (
    <section className="profile-section">
      <ProfileCard />
      <ProfileActivity />
    </section>
  );
}

export default ProfileSection;
