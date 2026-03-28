import { Outlet } from "react-router";
import EditProfileSidebar from "../../../widgets/edit-profile-sidebar/ui/EditProfileSidebar";

function EditProfilePage() {
  return (
    <div className="flex flex-col w-full min-h-full md:flex-row">
      <aside className="w-full border-b border-gray-300 bg-gray-300/30 shrink-0 md:w-64 md:border-b-0 md:border-r">
        <EditProfileSidebar />
      </aside>

      <main className="flex-1 min-w-0 px-4 py-4 md:px-6 md:py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default EditProfilePage;
