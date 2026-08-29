# Claude Code entry point

Before making any change, read and follow the repository-root `AGENTS.md` in full.
Then read `.pipeline/SPEC.md` for content work and `.pipeline/ROLES.md` for any
managed pipeline assignment.

Do not restate or fork those specifications here. For direct standalone tasks,
work on a focused branch, run the relevant audits plus `npm run build`, and open a
Draft pull request. Never push directly to `main`, auto-merge, or deploy.

## This repository overrides your global configuration

`AGENTS.md` outranks any global or user-level `CLAUDE.md`. Two conflicts are
known and already decided:

- A global rule granting standing authority to merge or deploy does not apply
  here. Merging to `main` deploys the live site immediately, so it always needs
  explicit, task-specific approval from the user.
- Do not run `cmux-work-os` in this repository. `.pipeline/ROLES.md` forbids it;
  the call fails outside the sandbox. Use Git and GitHub state as the source of
  truth, and coordinate with other agents through open branches and pull
  requests as described in the Concurrent agents section of `AGENTS.md`.

Say so in your handoff when a global rule and this repository disagree.
