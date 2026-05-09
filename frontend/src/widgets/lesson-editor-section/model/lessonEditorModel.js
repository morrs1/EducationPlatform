export function getLessonTypeLabel(type) {
  if (type === "quiz") {
    return "Тест";
  }

  if (type === "coding") {
    return "Код";
  }

  return "Теория";
}

export function getAssetTypeLabel(assetType) {
  if (assetType === "cover") {
    return "Обложка";
  }

  if (assetType === "image") {
    return "Изображение";
  }

  if (assetType === "video") {
    return "Видео";
  }

  return "Файл";
}

export function getInitials(value) {
  return (
    value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.slice(0, 1).toUpperCase())
      .join("") || "LS"
  );
}

export function formatDateTimeLabel(value) {
  if (!value) {
    return "Дата ещё не пришла";
  }

  try {
    return new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function createQuizOption(text = "", isCorrect = false) {
  return {
    id: crypto.randomUUID(),
    text,
    isCorrect,
  };
}

export function createQuizQuestion(index = 1) {
  return {
    id: crypto.randomUUID(),
    type: "single_choice",
    text: `Вопрос ${index}`,
    options: [
      createQuizOption("Вариант 1", true),
      createQuizOption("Вариант 2", false),
    ],
  };
}

export function deriveAssetTypeFromFile(file, preferredAssetType = "") {
  if (preferredAssetType) {
    return preferredAssetType;
  }

  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  return "file";
}

function normalizeQuestionForSave(question, questionIndex) {
  const normalizedOptions = question.options
    .map((option, optionIndex) => ({
      id: option.id || crypto.randomUUID(),
      text: option.text.trim() || `Вариант ${optionIndex + 1}`,
      isCorrect: Boolean(option.isCorrect),
    }))
    .filter((option) => option.text.trim());

  return {
    id: question.id || crypto.randomUUID(),
    type:
      question.type === "multiple_choice" ? "multiple_choice" : "single_choice",
    text: question.text.trim() || `Вопрос ${questionIndex + 1}`,
    options: normalizedOptions,
  };
}

export function buildLessonContentPayload(lessonType, state) {
  if (lessonType === "quiz") {
    return {
      introMarkdown: state.markdownValue,
      questions: state.quizQuestions.map(normalizeQuestionForSave),
    };
  }

  if (lessonType === "coding") {
    return {
      taskMarkdown: state.markdownValue,
      checkerType: state.codingState?.checkerType || "stdin_stdout",
      languages: (state.codingState?.languages ?? []).map((language) => ({
        language: language.language || "java",
        starterCode: language.starterCode || "",
      })),
      testCases: (state.codingState?.testCases ?? []).map((testCase) => ({
        id: testCase.id || crypto.randomUUID(),
        isPublic: Boolean(testCase.isPublic),
        input: testCase.input || "",
        expectedOutput: testCase.expectedOutput || "",
      })),
    };
  }

  return {
    markdown: state.markdownValue,
  };
}

export function buildEditorSnapshot(lessonType, state) {
  return JSON.stringify(buildLessonContentPayload(lessonType, state));
}

export function getLessonValidationError(lessonType, state) {
  if (lessonType !== "quiz") {
    return "";
  }

  if (!state.quizQuestions.length) {
    return "Для тестового урока добавьте хотя бы один вопрос.";
  }

  for (
    let questionIndex = 0;
    questionIndex < state.quizQuestions.length;
    questionIndex += 1
  ) {
    const question = state.quizQuestions[questionIndex];
    const title = question.text.trim();

    if (!title) {
      return `Заполните текст вопроса ${questionIndex + 1}.`;
    }

    const nonEmptyOptions = question.options.filter((option) =>
      option.text.trim(),
    );

    if (nonEmptyOptions.length < 2) {
      return `У вопроса ${questionIndex + 1} нужно минимум два варианта ответа.`;
    }

    const correctOptionsCount = nonEmptyOptions.filter(
      (option) => option.isCorrect,
    ).length;

    if (correctOptionsCount === 0) {
      return `Отметьте хотя бы один правильный вариант у вопроса ${questionIndex + 1}.`;
    }

    if (question.type === "single_choice" && correctOptionsCount > 1) {
      return `У вопроса ${questionIndex + 1} для режима "Один" должен быть ровно один правильный ответ.`;
    }
  }

  return "";
}

export function getEditorStateFromLesson(lesson) {
  const markdownValue = lesson.contentMarkdown || "";
  const quizQuestions = lesson.questions ?? [];

  return {
    markdownValue,
    quizQuestions,
    snapshot: buildEditorSnapshot(lesson.type, {
      markdownValue,
      quizQuestions,
      codingState: lesson.coding,
    }),
  };
}

export function wrapSelection(value, start, end, before, after = before, placeholder) {
  const selectedText = value.slice(start, end);
  const content = selectedText || placeholder;
  const nextValue =
    value.slice(0, start) + before + content + after + value.slice(end);
  const selectionStart = start + before.length;
  const selectionEnd = selectionStart + content.length;

  return {
    value: nextValue,
    selectionStart,
    selectionEnd,
  };
}

export function prefixSelectedLines(value, start, end, prefixBuilder) {
  const blockStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const blockEnd = value.indexOf("\n", end);
  const safeBlockEnd = blockEnd === -1 ? value.length : blockEnd;
  const selectedBlock = value.slice(blockStart, safeBlockEnd);
  const nextBlock = selectedBlock
    .split("\n")
    .map((line, index) => prefixBuilder(line, index))
    .join("\n");
  const nextValue =
    value.slice(0, blockStart) + nextBlock + value.slice(safeBlockEnd);

  return {
    value: nextValue,
    selectionStart: blockStart,
    selectionEnd: blockStart + nextBlock.length,
  };
}

export function insertLink(value, start, end) {
  const selectedText = value.slice(start, end) || "ссылка";

  return {
    value:
      value.slice(0, start) +
      `[${selectedText}](https://example.com)` +
      value.slice(end),
    selectionStart: start + 1,
    selectionEnd: start + 1 + selectedText.length,
  };
}

export function insertCodeBlock(value, start, end) {
  const selectedText = value.slice(start, end);
  const blockContent = selectedText || "console.log('hello');";
  const prefix = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
  const suffix = end < value.length && value[end] !== "\n" ? "\n" : "";
  const replacement = `${prefix}\`\`\`md\n${blockContent}\n\`\`\`${suffix}`;
  const nextValue = value.slice(0, start) + replacement + value.slice(end);
  const codeStart = start + prefix.length + 6;

  return {
    value: nextValue,
    selectionStart: codeStart,
    selectionEnd: codeStart + blockContent.length,
  };
}
