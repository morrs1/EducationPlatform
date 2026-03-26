import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useLocation,
  Outlet,
} from "react-router";
import "./index.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import AccountPage from "./pages/AccountPage";
import ProfileSection from "./features/account/components/profile/ProfileSection";
import CurrentCoursesSection from "./features/account/components/currentCourses/CurrentCoursesSection";
import CompletedCoursesSection from "./features/account/components/completedCourses/CompletedCoursesSection";
import FavouriteCoursesSection from "./features/account/components/favouriteCourses/FavouriteCoursesSection";
import CertificatesSection from "./features/account/components/CertificatesSection";
import { useSelector } from "react-redux";

function ProtectedRoute() {
  const isLoged = useSelector((state) => state.auth.isLoged);
  const location = useLocation();

  if (!isLoged) {
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
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
