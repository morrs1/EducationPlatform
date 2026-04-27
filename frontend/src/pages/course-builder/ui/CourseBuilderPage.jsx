import { Outlet } from "react-router";
import { useState } from "react";
import CourseBuilderSidebar from "../../../widgets/course-builder-sidebar/ui/CourseBuilderSidebar";

function CourseBuilderPage() {
  const [modules, setModules] = useState([]);

  function addModule() {
    setModules((currentModules) => [
      ...currentModules,
      {
        id: `module-${currentModules.length + 1}`,
        title: `Новый модуль ${currentModules.length + 1}`,
        description: "",
        lessons: [],
        draftLessonTitle: "",
      },
    ]);
  }

  function updateModuleField(moduleId, field, value) {
    setModules((currentModules) =>
      currentModules.map((module) =>
        module.id === moduleId ? { ...module, [field]: value } : module,
      ),
    );
  }

  function addLesson(moduleId) {
    setModules((currentModules) =>
      currentModules.map((module) => {
        if (module.id !== moduleId) {
          return module;
        }

        const nextLessonTitle = module.draftLessonTitle.trim();

        if (!nextLessonTitle) {
          return module;
        }

        return {
          ...module,
          lessons: [
            ...module.lessons,
            {
              id: `${module.id}-lesson-${module.lessons.length + 1}`,
              title: nextLessonTitle,
            },
          ],
          draftLessonTitle: "",
        };
      }),
    );
  }

  return (
    <div className="course-builder-layout">
      <aside className="course-builder-layout-sidebar-rail">
        <CourseBuilderSidebar />
      </aside>

      <main className="course-builder-layout-main-rail">
        <section className="course-builder-page">
          <Outlet
            context={{ modules, addModule, updateModuleField, addLesson }}
          />
        </section>
      </main>
    </div>
  );
}

export default CourseBuilderPage;
