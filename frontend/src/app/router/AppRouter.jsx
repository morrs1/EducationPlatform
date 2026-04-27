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
import SearchPage from "../../pages/search/ui/SearchPage";
import CoursePage from "../../pages/course/ui/CoursePage";
import AccountPage from "../../pages/account/ui/AccountPage";
import EditProfilePage from "../../pages/edit-profile/ui/EditProfilePage";
import NotificationsPage from "../../pages/notifications/ui/NotificationsPage";
import LessonPage from "../../pages/lesson/ui/LessonPage";
import TeachPage from "../../pages/teach/ui/TeachPage";
import CourseBuilderPage from "../../pages/course-builder/ui/CourseBuilderPage";
import LessonEditorPage from "../../pages/lesson-editor/ui/LessonEditorPage";

import ProfileSection from "../../widgets/profile-section/ui/ProfileSection";
import CurrentCoursesSection from "../../widgets/current-courses-section/ui/CurrentCoursesSection";
import CompletedCoursesSection from "../../widgets/completed-courses-section/ui/CompletedCoursesSection";
import FavouriteCoursesSection from "../../widgets/favourite-courses-section/ui/FavouriteCoursesSection";
import CertificatesSection from "../../widgets/certificates-section/ui/CertificatesSection";
import { selectIsLogged } from "../../features/auth";
import UpdateProfileSection from "../../widgets/update-profile-section/ui/UpdateProfileSection";
import ChangePasswordSection from "../../widgets/change-password-section/ui/ChangePasswordSection";
import ChangeEmailSection from "../../widgets/change-email-section/ui/ChangeEmailSection";
import CreateCourseSection from "../../widgets/create-course-section/ui/CreateCourseSection";
import TeachCoursesSection from "../../widgets/teach-courses-section/ui/TeachCoursesSection";
import CourseDescriptionSection from "../../widgets/course-description-section/ui/CourseDescriptionSection";
import CourseSyllabusSection from "../../widgets/course-syllabus-section/ui/CourseSyllabusSection";
import CourseContentEditorSection from "../../widgets/course-content-editor-section/ui/CourseContentEditorSection";
import LessonEditorSection from "../../widgets/lesson-editor-section/ui/LessonEditorSection";

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
      { path: "search", element: <SearchPage /> },
      { path: "courses/:courseId", element: <CoursePage /> },
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
            children: [
              { index: true, element: <UpdateProfileSection /> },
              { path: "password", element: <ChangePasswordSection /> },
              { path: "email", element: <ChangeEmailSection /> },
            ],
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
          {
            path: "courses/:courseId/lessons/:lessonId",
            element: <LessonPage />,
          },
          {
            path: "course/:courseId",
            element: <CourseBuilderPage />,
            children: [
              { index: true, element: <Navigate to="syllabus" replace /> },
              { path: "description", element: <CourseDescriptionSection /> },
              { path: "syllabus", element: <CourseSyllabusSection /> },
              { path: "edit", element: <CourseContentEditorSection /> },
            ],
          },
          {
            path: "course/:courseId/edit-lesson/:lessonId",
            element: <LessonEditorPage />,
            children: [{ index: true, element: <LessonEditorSection /> }],
          },
          {
            path: "teach",
            element: <TeachPage />,
            children: [
              { index: true, element: <Navigate to="courses" replace /> },
              { path: "courses", element: <TeachCoursesSection /> },
              { path: "courses/new", element: <CreateCourseSection /> },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
