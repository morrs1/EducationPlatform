import { Outlet } from "react-router";
import EditProfileSidebar from "../../../widgets/edit-profile-sidebar/ui/EditProfileSidebar";

function EditProfilePage() {
  return (
    <div className="profile-layout">
      <aside className="profile-layout-sidebar-rail">
        <EditProfileSidebar />
      </aside>

      <main className="profile-layout-main-rail">
        <Outlet />
      </main>
    </div>
  );
}

export default EditProfilePage;
