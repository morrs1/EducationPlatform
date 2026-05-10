import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useLocation,
  Outlet,
} from "react-router";
import { useSelector } from "react-redux";

import { Layout } from "../layout";
import { HomePage as Home } from "../../pages/home";
import { SearchPage } from "../../pages/search";
import { CoursePage } from "../../pages/course";
import { AccountPage } from "../../pages/account";
import { EditProfilePage } from "../../pages/edit-profile";
import { LessonPage } from "../../pages/lesson";
import { TeachPage } from "../../pages/teach";
import { CourseBuilderPage } from "../../pages/course-builder";
import { LessonEditorPage } from "../../pages/lesson-editor";
import { AdminPage } from "../../pages/admin";

import { ProfileSection } from "../../widgets/profile-section";
import { CurrentCoursesSection } from "../../widgets/current-courses-section";
import { CompletedCoursesSection } from "../../widgets/completed-courses-section";
import { CertificatesSection } from "../../widgets/certificates-section";
import { selectIsLogged, selectUserRole } from "../../features/auth";
import { UpdateProfileSection } from "../../widgets/update-profile-section";
import { ChangePasswordSection } from "../../widgets/change-password-section";
import { ChangeEmailSection } from "../../widgets/change-email-section";
import { CreateCourseSection } from "../../widgets/create-course-section";
import { TeachCoursesSection } from "../../widgets/teach-courses-section";
import { CourseDescriptionSection } from "../../widgets/course-description-section";
import { CourseSyllabusSection } from "../../widgets/course-syllabus-section";
import { CourseContentEditorSection } from "../../widgets/course-content-editor-section";
import { LessonEditorSection } from "../../widgets/lesson-editor-section";

function ProtectedRoute() {
  const isLogged = useSelector(selectIsLogged);
  const location = useLocation();

  if (!isLogged) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function AdminRoute() {
  const isLogged = useSelector(selectIsLogged);
  const role = useSelector(selectUserRole);
  const location = useLocation();

  if (!isLogged) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (role !== "ADMIN") {
    return <Navigate to="/" replace />;
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
        element: <AdminRoute />,
        children: [{ path: "admin", element: <AdminPage /> }],
      },
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
              {
                index: true,
                element: <Navigate to="courses/drafts" replace />,
              },
              {
                path: "courses",
                element: <Navigate to="drafts" replace />,
              },
              {
                path: "courses/published",
                element: <TeachCoursesSection variant="published" />,
              },
              {
                path: "courses/drafts",
                element: <TeachCoursesSection variant="drafts" />,
              },
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
