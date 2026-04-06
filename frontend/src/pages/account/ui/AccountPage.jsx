import { Outlet } from "react-router";
import AccountSidebar from "../../../widgets/account-sidebar/ui/AccountSidebar";

function AccountPage() {
  return (
    <div className="profile-layout">
      <aside className="profile-layout-sidebar-rail">
        <AccountSidebar />
      </aside>

      <main className="profile-layout-main-rail">
        <Outlet />
      </main>
    </div>
  );
}

export default AccountPage;
