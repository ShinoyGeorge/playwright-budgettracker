# Two Jars E2E — Documentation Index

Start here. This file just tells you which document to open for what.

| Document | Purpose |
|---|---|
| `AUTOMATION.md` | How the framework itself is built: fixtures, page objects, `DataGrid`, types discipline, where each module's automation lives, conventions for writing new tests. Read this before writing any test code. |
| `JIRA_WORKFLOW.md` | The stage-by-stage process to follow when generating tests from a Jira ticket, including every human review checkpoint. |
| `CLAUDE.md` (project root) | Entry point for AI assistants specifically — points here and to the other docs, doesn't duplicate content. |
| `docs/modules/<module>.md` | Scenario-level test coverage for that module — the single source of truth for what's tested and its current status. Created once a real test script exists for that module. |

## Module-specific docs

A `docs/<module>.md` is created only once we've actually written a test
script for that module — not up front for every domain. Each doc only
contains what's actually been discussed/tested — no assumed content.

| Module | Doc |
|---|---|
| Household onboarding & auth | `docs/household-onboarding.md` |
