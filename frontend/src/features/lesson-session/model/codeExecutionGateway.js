function normalizeCode(code) {
  return (code ?? "").replace(/\s+/g, " ").trim();
}

function buildFailureCases(cases, reason) {
  return cases.map((testCase, index) => ({
    index: index + 1,
    status: index === 0 ? "failed" : "not_run",
    input: testCase.input,
    expectedOutput: testCase.expectedOutput,
    actualOutput: "",
    message: index === 0 ? reason : "Тест не был запущен.",
  }));
}

function buildSuccessCases(cases) {
  return cases.map((testCase, index) => ({
    index: index + 1,
    status: "passed",
    input: testCase.input,
    expectedOutput: testCase.expectedOutput,
    actualOutput: testCase.expectedOutput,
    message: "Тест пройден.",
  }));
}

function evaluateContainsStrategy(code, config) {
  const normalizedCode = normalizeCode(code);
  const requiredSnippets = config.requiredSnippets ?? [];
  const missingSnippet = requiredSnippets.find(
    (snippet) => !normalizedCode.includes(snippet),
  );

  if (missingSnippet) {
    return {
      ok: false,
      reason: `В решении пока не хватает обязательного фрагмента: ${missingSnippet}`,
    };
  }

  return {
    ok: true,
  };
}

function evaluateMockExecution(code, grader) {
  const strategy = grader.mockExecution?.strategy ?? null;

  if (!code?.trim()) {
    return {
      ok: false,
      reason: "Добавьте код решения перед запуском.",
    };
  }

  if (!strategy) {
    return {
      ok: false,
      reason: "Для урока пока не настроен mock-runner.",
    };
  }

  if (strategy === "contains") {
    return evaluateContainsStrategy(code, grader.mockExecution);
  }

  return {
    ok: false,
    reason: `Неизвестная стратегия mock-runner: ${strategy}`,
  };
}

function buildRunResponse({ cases, evaluation }) {
  if (!evaluation.ok) {
    return {
      status: "failed",
      passedCases: 0,
      totalCases: cases.length,
      feedback: evaluation.reason,
      cases: buildFailureCases(cases, evaluation.reason),
    };
  }

  return {
    status: "success",
    passedCases: cases.length,
    totalCases: cases.length,
    feedback: "Видимые тесты пройдены.",
    cases: buildSuccessCases(cases),
  };
}

function buildSubmissionResponse({ lesson, code, cases, evaluation }) {
  if (!evaluation.ok) {
    return {
      status: "incorrect",
      score: 0,
      maxScore: lesson.points ?? 0,
      feedback: evaluation.reason,
      answerSnapshot: {
        code,
      },
      passedCases: 0,
      totalCases: cases.length,
      cases: buildFailureCases(cases, evaluation.reason),
    };
  }

  return {
    status: "correct",
    score: lesson.points ?? 0,
    maxScore: lesson.points ?? 0,
    feedback: "Все тесты пройдены.",
    answerSnapshot: {
      code,
    },
    passedCases: cases.length,
    totalCases: cases.length,
    cases: buildSuccessCases(cases),
  };
}

function runMockCodeExecution({ lesson, grader, code, mode }) {
  const cases =
    mode === "run"
      ? grader.visibleCases ?? []
      : [...(grader.visibleCases ?? []), ...(grader.hiddenCases ?? [])];
  const evaluation = evaluateMockExecution(code, grader);

  if (mode === "run") {
    return buildRunResponse({ cases, evaluation });
  }

  return buildSubmissionResponse({ lesson, code, cases, evaluation });
}

export async function executeCodeStep({ lesson, grader, code, mode }) {
  // Backend-ready boundary:
  // replace this local mock with a real lesson run/submission API later.
  return Promise.resolve(runMockCodeExecution({ lesson, grader, code, mode }));
}
