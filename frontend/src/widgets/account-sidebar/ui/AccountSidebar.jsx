import { NavLink } from "react-router";
function AccountSidebar() {
  return (
    <nav className="flex gap-2 p-3 overflow-x-auto md:flex-col md:overflow-visible">
      <NavLink to="/account" end className="account-sidebar-navlink">
        Профиль
      </NavLink>
      <NavLink to="/account/currentCourses" className="account-sidebar-navlink">
        Прохожу сейчас
      </NavLink>
      <NavLink
        to="/account/completedCourses"
        className="account-sidebar-navlink"
      >
        Завершенные курсы
      </NavLink>
      <NavLink to="/account/favourites" className="account-sidebar-navlink">
        Избранное
      </NavLink>
      <NavLink to="/account/certificates" className="account-sidebar-navlink">
        Сертификаты
      </NavLink>
    </nav>
  );
}

export default AccountSidebar;
