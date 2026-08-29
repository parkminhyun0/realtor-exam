# Conventions

This file exists so Aider and similar tools load the repository standard.

The full operating instruction is the repository-root `AGENTS.md`. Read it before
proposing or editing code. For study content, `.pipeline/SPEC.md` is the sole
specification; for a managed pipeline task, follow `.pipeline/ROLES.md`.

Summary of the hard limits, all of which `AGENTS.md` states in full: never invent
legal or exam facts, never weaken an audit to make CI green, never work directly
on `main`, never auto-merge or deploy, and run the closest targeted audit plus
`npm run build` before handing off.
