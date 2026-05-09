export const initialModuleDraft = {
  title: "",
  description: "",
  estimatedMinutes: "0",
};

export function createInitialLessonDraft() {
  return {
    title: "",
    type: "theory",
    estimatedMinutes: "0",
    isPreview: false,
  };
}

export function getLessonTypeLabel(type) {
  if (type === "quiz") {
    return "Тест";
  }

  if (type === "coding") {
    return "Код";
  }

  return "Теория";
}

function normalizeMinutes(value) {
  return Math.max(0, Number.parseInt(value, 10) || 0);
}

export function buildModulePayload(moduleDraft, position) {
  const title = moduleDraft.title.trim();
  const description = moduleDraft.description.trim();

  if (!title) {
    return {
      error: "Введите название нового модуля.",
      payload: null,
    };
  }

  if (!description) {
    return {
      error: "Добавьте описание модуля.",
      payload: null,
    };
  }

  return {
    error: "",
    payload: {
      title,
      description,
      position,
      estimatedMinutes: normalizeMinutes(moduleDraft.estimatedMinutes),
    },
  };
}

export function buildLessonPayload(lessonDraft, module) {
  const title = lessonDraft.title.trim();

  if (!title) {
    return {
      error: "Введите название урока.",
      payload: null,
    };
  }

  return {
    error: "",
    payload: {
      moduleId: module.id,
      title,
      type: lessonDraft.type,
      position: module.lessons.length + 1,
      estimatedMinutes: normalizeMinutes(lessonDraft.estimatedMinutes),
      isPreview: Boolean(lessonDraft.isPreview),
    },
  };
}
