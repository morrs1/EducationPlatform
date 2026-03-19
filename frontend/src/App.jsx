import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import AccountPage from "./pages/AccountPage";
import ProfileSection from "./features/account/components/ProfileSection";
import CurrentCoursesSection from "./features/account/components/CurrentCoursesSection";
import CompletedCoursesSection from "./features/account/components/CompletedCoursesSection";
import FavouriteCoursesSection from "./features/account/components/FavouriteCoursesSection";
import CertificatesSection from "./features/account/components/CertificatesSection";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "account",
        element: <AccountPage />,
        children: [
          { index: true, element: <ProfileSection /> },
          { path: "currentCourses", element: <CurrentCoursesSection /> },
          { path: "completedCourses", element: <CompletedCoursesSection /> },
          { path: "favourites", element: <FavouriteCoursesSection /> },
          { path: "certificates", element: <CertificatesSection /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
