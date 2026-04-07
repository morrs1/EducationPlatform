export const mockStepGraders = [
  {
    id: "grader-python-beginners-m1-l1-step-3",
    type: "quiz_choice",
    multiple: false,
    options: [
      { id: "a", label: "Hello" },
      { id: "b", label: "Привет" },
      { id: "c", label: "Ошибка" },
    ],
    correctOptionIds: ["b"],
  },
  {
    id: "grader-python-beginners-m1-l1-step-4",
    type: "quiz_text",
    acceptedAnswers: ["str", "string"],
    trim: true,
    ignoreCase: true,
  },
  {
    id: "grader-python-beginners-m1-l1-step-5",
    type: "code",
    language: "python",
    runner: "stdin_stdout",
    starterCode: 'name = input()\nprint("Привет, " + name + "!")',
    mockExecution: {
      strategy: "contains",
      requiredSnippets: ["input(", "print(", "Привет", "!"],
    },
    visibleCases: [
      {
        input: "Баграт\n",
        expectedOutput: "Привет, Баграт!\n",
      },
    ],
    hiddenCases: [
      {
        input: "Анна\n",
        expectedOutput: "Привет, Анна!\n",
      },
    ],
  },
  {
    id: "grader-python-beginners-m1-l1-step-6",
    type: "code",
    language: "python",
    runner: "stdin_stdout",
    starterCode: "a = int(input())\nb = int(input())\nprint(a + b)",
    mockExecution: {
      strategy: "contains",
      requiredSnippets: ["input(", "int(", "print(", "+"],
    },
    visibleCases: [
      {
        input: "2\n3\n",
        expectedOutput: "5\n",
      },
    ],
    hiddenCases: [
      {
        input: "10\n7\n",
        expectedOutput: "17\n",
      },
      {
        input: "0\n0\n",
        expectedOutput: "0\n",
      },
    ],
  },
];
