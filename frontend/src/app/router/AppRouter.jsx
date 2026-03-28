import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useLocation,
  Outlet,
} from "react-router";
import { useSelector } from "react-redux";

import Layout from "../../widgets/layout/ui/Layout";
import Home from "../../pages/home/ui/HomePage";
import AccountPage from "../../pages/account/ui/AccountPage";
import EditProfilePage from "../../pages/edit-profile/ui/EditProfilePage";

import ProfileSection from "../../widgets/profile-section/ui/ProfileSection";
import CurrentCoursesSection from "../../widgets/current-courses-section/ui/CurrentCoursesSection";
import CompletedCoursesSection from "../../widgets/completed-courses-section/ui/CompletedCoursesSection";
import FavouriteCoursesSection from "../../widgets/favourite-courses-section/ui/FavouriteCoursesSection";
import CertificatesSection from "../../widgets/certificates-section/ui/CertificatesSection";
import { selectIsLogged } from "../../features/auth";

function ProtectedRoute() {
  const isLogged = useSelector(selectIsLogged);
  const location = useLocation();

  if (!isLogged) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "account",
            element: <AccountPage />,
            children: [
              { index: true, element: <ProfileSection /> },
              { path: "currentCourses", element: <CurrentCoursesSection /> },
              {
                path: "completedCourses",
                element: <CompletedCoursesSection />,
              },
              { path: "favourites", element: <FavouriteCoursesSection /> },
              { path: "certificates", element: <CertificatesSection /> },
            ],
          },
          {
            path: "editProfile",
            element: <EditProfilePage />,
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
