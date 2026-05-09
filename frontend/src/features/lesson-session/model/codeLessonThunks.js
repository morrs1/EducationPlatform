import { setRunResult } from "./lessonSessionSlice";
import { selectLessonDraft } from "./selectors";
import { executeCodeStep } from "./codeExecutionGateway";
import { createTimestamp } from "./time";

export function runCodeLesson({ lesson }) {
  return async (dispatch, getState) => {
    if (!lesson || lesson.type !== "code" || !lesson.grader) {
      return {
        status: "failed",
        passedCases: 0,
        totalCases: 0,
        feedback: "Для урока пока не настроен code runner.",
        cases: [],
      };
    }

    const draft = selectLessonDraft(getState(), lesson.id);
    const code = draft?.code ?? "";
    const result = await executeCodeStep({
      lesson,
      grader: lesson.grader,
      code,
      mode: "run",
    });

    dispatch(
      setRunResult({
        lessonId: lesson.id,
        result: {
          ...result,
          updatedAt: createTimestamp(),
        },
      }),
    );

    return result;
  };
}
