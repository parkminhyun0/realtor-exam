# AGENTS.md — realtor-exam

This file is the repository-wide entry point for AI coding agents. It applies to
every file unless a deeper `AGENTS.md` says otherwise.

## Mission

Maintain the 2026 37th Korean licensed real-estate-agent exam study app. A change
is successful only when it preserves factual accuracy, makes the material easy to
scan and read, and passes the repository's existing verification gates.

Repository: `https://github.com/parkminhyun0/realtor-exam`

Live site: `https://parkminhyun0.github.io/realtor-exam/#/`

## Read before editing

Read these sources in order. Do not copy their rules into new files.

1. This `AGENTS.md` for repository workflow and safety.
2. `.pipeline/SPEC.md` for the only authoritative content, taxonomy, calculation,
   and evidence specification.
3. `.pipeline/ROLES.md` when working in the managed multi-model pipeline.
4. `docs/exam37-law-baseline.md` before changing legal or exam-regime content.
5. `package.json` and `.github/workflows/*.yml` for current commands and gates.

Use the most specific authority for the work: this file for repository workflow,
`.pipeline/SPEC.md` for study-content shape and evidence, and
`.pipeline/ROLES.md` for managed pipeline roles. Ask the user when a conflict
would change content truth, deployment, or a protected workflow.

## Non-negotiable rules

- Never invent an article number, deadline, rate, amount, area, exception,
  precedent, or answer. Follow `.pipeline/SPEC.md` section 4 and leave a clearly
  reported verification gap when evidence is missing.
- Preserve the exam-law baseline documented in `docs/exam37-law-baseline.md`.
  Later amendments must stay visibly separated according to that document.
- Do not delete, silently rewrite, or reduce existing study content merely to make
  a layout or test pass.
- Never weaken, remove, skip, or rewrite an audit to make CI green.
- Do not expose credentials in source, browser code, logs, screenshots, commits,
  or pull requests.
- Do not work directly on `main`. Create a focused branch and a Draft pull request.
  The user decides when it becomes ready and when it merges.
- A change to `AGENTS.md`, `.pipeline/`, `.github/workflows/`, permissions,
  security, or deployment is a system/manual change and must not auto-merge.
- Do not add a second Pages deployment path. `.github/workflows/deploy-pages.yml`
  is the only deployment workflow, and a merge to `main` deploys immediately.

## Managed pipeline versus standalone work

`.pipeline/ROLES.md` assigns different model families to implementation and
review in the managed curriculum-normalization pipeline. Obey those assignments
for dispatched pipeline tasks. For a separate task directly authorized by the
user, any AI may implement it, but the branch, Draft PR, verification, and
no-auto-merge rules above still apply.

## Technology and commands

- Node.js 22
- React 19
- Vite 8
- Hash-based client routing
- GitHub Pages base path: `/realtor-exam/`

```bash
npm install
npm run dev
npm run build
npm run preview
```

`npm run build` is the required full gate. It runs all content, navigation,
responsive-layout, and subject consistency audits before `vite build`. During
development, run the closest targeted `verify:*` or `audit:*` script first, then
run the full build before handing off the change.

## Repository map

| Area | Purpose |
|---|---|
| `src/App.jsx` | Dashboard, hash routes, shared header/footer and page shell |
| `src/*Page.jsx` | Six subject page components |
| `src/data/` | Structured subject, law, calculation, and question content |
| `src/GlobalSearch.jsx`, `src/siteSearch.js` | Site-wide search UI and index |
| `src/subject-four-level-nav.*` | Shared four-level subject table of contents |
| `src/LawTextViewer.jsx`, `src/law-viewer.css` | Law text viewer |
| `src/*.css` | Shared and subject-scoped presentation rules |
| `public/` | Static assets, diagrams, packed public-law source, version metadata |
| `scripts/` | Build-blocking verification and audit scripts |
| `.pipeline/` | Managed multi-model workflow and the content specification |
| `.github/workflows/` | Pull-request CI and the single Pages deployment workflow |

Use `rg` to locate the current owner of a selector, label, data field, or route
before editing. Several later CSS guard files intentionally override earlier
styles; do not move imports or merge styles until the related audits are read.

## Product invariants

- Keep the interface simple, highly legible, and quickly scannable. Avoid adding
  decorative density, competing cards, or motion that slows study.
- Preserve all six subjects and the dashboard route.
- Preserve the shared four-level navigation: category → major → middle → leaf.
  The current TOC label size is locked by an audit; change it only with explicit
  user approval and a corresponding intentional policy update.
- The visual reference standard is enforced by
  `scripts/audit-subject-ui-reference-standard.mjs`: tax law supplies category
  navigation conventions, while civil law supplies body/card/table conventions.
- Preserve global search, keyboard access, focus visibility, the skip link,
  responsive mobile behavior, and reduced-motion handling.
- Keep subject-specific runtime behavior isolated. Share visual tokens and common
  components instead of borrowing another subject's root class.
- Check desktop and mobile layouts after any visible change. Long Korean labels,
  tables, badges, and nested navigation must not overlap or clip.

## Content changes

1. Find the canonical data module and its renderer before editing.
2. Read `.pipeline/SPEC.md`; it is the only content-format specification.
3. Verify legal facts against the sources required there and record the baseline.
4. Preserve the existing object shape, IDs, search indexing, and navigation links.
5. Run the subject-specific audits and the full build.

The packed public-law source is intentionally encoded. Use the read command in
`.pipeline/SPEC.md`; do not hand-edit the `.dat` parts without understanding the
packing workflow and running the full verification suite.

## Safe change workflow

1. Inspect the latest `main`, current branches/PRs, and working tree. Do not create
   a duplicate task branch.
2. State the task scope and identify affected source, data, style, and audit files.
3. Create one focused branch. Never mix unrelated cleanup into the change.
4. Implement the smallest coherent change and preserve unrelated user work.
5. Run targeted verification, then `npm run build`.
6. For visible changes, inspect representative desktop and mobile views.
7. Open a Draft PR with: problem, approach, affected routes, evidence, test output,
   risk/rollback notes, and anything that still needs human verification.
8. Stop before merge or deployment unless the user explicitly authorizes it and
   the current repository policy permits it.

## Completion report

Every AI handoff must list:

- branch and Draft PR URL, or a patch when write access is unavailable;
- files changed and the user-visible effect;
- exact verification commands and results;
- legal/content sources used, when applicable;
- remaining risks or manual checks;
- confirmation that `main` and the live site were not changed, unless explicitly
  authorized.
