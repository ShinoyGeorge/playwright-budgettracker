# Two Jars — E2E Test Framework

Playwright end-to-end tests for the [Two Jars household budget
tracker](https://github.com/) — covers both direct API testing and full
browser-driven UI testing against the same running application.

## Stack

- **Test runner:** Playwright (TypeScript)
- **Structure:** Page Object Model, with a generic `Grid`/`GridRow`/
  `GridColumn` abstraction for reading table-based UI without hardcoding
  column order
- **Environments:** `local` / `qa` / `uat`, selected via `TEST_ENV`
- **Containerization:** Dockerfile included, using Microsoft's official
  Playwright base image

## Documentation

Start at [`docs/INDEX.md`](docs/INDEX.md) — it explains what each
document covers and where to find module-specific detail.

| Doc | What it's for |
|---|---|
| `docs/AUTOMATION.md` | How the framework is built: fixtures, page objects, conventions. Read before writing any test. |
| `docs/JIRA_WORKFLOW.md` | The process for turning a Jira ticket into reviewed, traced automated tests (Jira + AIO Tests via MCP). |
| `docs/modules/<module>.md` | Which scenarios have confirmed automated coverage, per feature area. |
| `CLAUDE.md` | Entry point for AI assistants working in this repo. |

## Project structure

```
src/
  helpers/     env.ts, fixtures.ts, testUser.ts, types.ts, db.ts
  pages/        Page objects (LoginPage, RegisterPage, DashboardPage,
                AdminPage) and pages/components/ (Grid, GridRow,
                GridColumn, and the per-table classes extending Grid)
  tests/
    api/    Fast, API-only tests
    ui/      Full browser-driven tests
docs/          See "Documentation" above
Dockerfile
.dockerignore
```

## Setup

```powershell
npm install
npx playwright install --with-deps
```

Copy `src/.env.example` to `src/.env.local` and fill in real values
(backend URL, frontend URL, database connection string, and credentials
for each test identity in `TestData`). Never commit a real `.env.*` file
— they're gitignored for a reason.

## Running tests

Requires the Two Jars backend and frontend to already be running (locally,
or pointed at a deployed environment via `TEST_ENV`).

```powershell
# everything
npx playwright test

# just one project
npx playwright test --project=api
npx playwright test --project=ui
npx playwright test --project=regression   # tests tagged @regression, across both folders

# against a specific environment
$env:TEST_ENV="qa"; npx playwright test

# view the last HTML report
npx playwright show-report
```

## Running in Docker

```powershell
docker build -t two-jars-e2e .
docker run --rm --env-file src\.env.docker two-jars-e2e
```

`src/.env.docker` is a separate environment file from `.env.local` —
when the app under test is running on your host machine (not itself
containerized), URLs in this file need to use `host.docker.internal`
instead of `localhost`, since `localhost` inside a container refers to
the container itself. See `docs/AUTOMATION.md` for anything
Docker-networking-specific that trips people up (CORS origins, Vite's
`allowedHosts`, etc., if documented there).

## Test data

Tests use a fixed set of identities (`TestData` in
`src/helpers/testUser.ts`) — an admin and a couple of household members —
loaded from environment variables, never hardcoded. These identities
aren't seeded by a script: the household-onboarding tests themselves
(registration + admin/member approval, via the real UI) are what bring
them into existence. Other tests build on top of identities that already
exist because an onboarding test created and approved them.
