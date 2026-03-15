Run code quality checks for the answer-service project and fix all issues found.

Execute the following steps in order:

1. Run `just lint` (ruff format + ruff check + codespell). Fix every reported issue.
2. Run `just mypy`. Fix every type error — never use `# type: ignore` without a written justification comment.
3. Run `just bandit`. Investigate any security warnings.
4. If tests exist, run `pytest -v` and ensure all tests pass.

Report results after each step. If errors are found, fix them and re-run the check before proceeding to the next step. Do not move on while errors remain.
