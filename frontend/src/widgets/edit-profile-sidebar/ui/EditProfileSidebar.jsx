import { NavLink } from "react-router";
function EditProfileSidebar() {
  return (
    <nav className="edit-profile-sidebar">
      <NavLink to="/editProfile" end className="edit-profile-sidebar-navlink">
        Редактировать профиль
      </NavLink>

      <NavLink
        to="/editProfile/password"
        className="edit-profile-sidebar-navlink"
      >
        Изменить пароль
      </NavLink>

      <NavLink to="/editProfile/email" className="edit-profile-sidebar-navlink">
        Изменить почту
      </NavLink>
    </nav>
  );
}

export default EditProfileSidebar;
