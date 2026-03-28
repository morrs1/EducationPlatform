# AGENTS.md

## Scope

This file applies to the whole repository.

## Repository Layout

The repository contains multiple parts, but frontend work should follow the dedicated instructions in:

- `frontend/AGENTS.md`

Current top-level areas:

- `frontend/` - active React/Vite client
- `answer_service/` - Python backend service
- `user_service/` - partial service scaffolding

## Root Rules

- Do not assume the repo root is a Node workspace. There is no root `package.json`.
- Run frontend commands inside `frontend/`.
- Run backend Python commands inside `answer_service/`.
- Check `git status --short` before editing because the worktree may already contain ongoing refactors.
