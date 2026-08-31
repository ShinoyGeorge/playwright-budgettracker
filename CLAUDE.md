# Instructions for AI assistants working in this project

Read `docs/INDEX.md` first — it explains which document to check for what,
and where to find feature/module-specific detail. Then read
`docs/AUTOMATION.md` in full before writing or modifying any test code; it
is the framework's source of truth for fixtures, page objects, types
discipline, and conventions.

If the user gives you a Jira ticket key and asks for test coverage,
follow `docs/JIRA_WORKFLOW.md` exactly, in order, including every review
checkpoint. Do not shortcut or reorder its stages.

Do not duplicate `docs/AUTOMATION.md`'s or `docs/JIRA_WORKFLOW.md`'s
content into this file or into any other document — if something about
how the framework works or the process flows changes, update that
document itself.

When you add a new page object, fixture, or convention, update
`docs/AUTOMATION.md` in the same change. When a module's test cases or
their status change, update that module's `docs/modules/<module>.md` directly —
that file is the single source of truth for coverage, there is no
separate coverage log to also keep in sync.
