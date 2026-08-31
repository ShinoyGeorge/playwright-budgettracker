# Two Jars — Automation Framework Reference

How the E2E automation is built: fixtures, page objects, conventions.
For a log of what's actually tested, see COVERAGE.md. For AI-assistant-
specific instructions, see CLAUDE.md.

## Environment setup

- Environment files: `.env.local`, `.env.qa`, `.env.uat` (gitignored;
  `.env.example` is the committed template). Loaded via `helpers/env.ts`,
  which reads `TEST_ENV` (defaults to `local`) to pick the right file.
- Never hardcode credentials, URLs, or the database connection string —
  always go through `requireEnv("SOME_KEY")` from `helpers/env.ts`.
- `playwright.config.ts` currently defines a single **project**,
  `regression`: `testDir: ./src/tests`, `grep: /@regression/`,
  `headless: false`, 120s timeout. Because it's grep-filtered, **an
  untagged test will not run at all** — tag every new test `@regression`
  (see "Tagging") unless/until separate `api`/`ui` projects are added.
- Run with `npx playwright test --project=regression`. Add `--list` to
  collect tests without executing them (useful as a quick compile check).

## Directory structure

Everything lives under `src/`, and `.env.*` files sit in `src/` too
(`helpers/env.ts` resolves them relative to its own directory).

```
src/
  types.ts          ControlFinder — the Grid control-finder signature.
  helpers/
    env.ts          Loads the right src/.env.* file based on TEST_ENV; exports requireEnv()
    types.ts         Shared context/fixture types: ApiContext, UIContext, Fixtures.
    fixtures.ts       Custom Playwright test object (`test`/`expect`), exporting
                      two fixtures: `apiContext` and `uiContext`.
    testUser.ts        `TestData` — the fixed set of test identities, loaded from
                       env vars, never hardcoded. Also declares TestUser/Role.
    db.ts               Direct Postgres access (via `pg`, not Prisma) for test
                        cleanup only. `deleteTestUser(email)` etc.
  pages/
    LoginPage.ts, RegisterPage.ts, DashboardPage.ts, AdminPage.ts
    components/
      Grid.ts        Generic table abstraction (see "Grid" below), split across
      GridRow.ts     three files — Grid → GridRow[] → GridColumn[].
      GridColumn.ts
      AccountsTable.ts, TransactionsTable.ts, RecurringBillsTable.ts,
      BudgetsTable.ts    Each extends Grid, configuring only its own
                         containerSelector and controlFinders.
  tests/
    login.spec.ts
    ui/     Full browser-driven tests (uiContext fixture)
```

There is no `tests/api/` directory yet — API-only tests using the
`apiContext` fixture have a fixture but no home directory or config
project of their own so far.

Not every table subclass has a verified counterpart in the app yet: the
`Grid` subclass actually exercised by a test today is
`AdminPendingRequestsTable` (declared in `pages/AdminPage.ts`, not in
`components/`).

## Fixtures — how sessions work

- **`uiContext()`** — returns `{ page, browserContext }`. Purely creates an
  isolated browser session. It does **not** log anyone in — logging in is
  a real UI action and belongs to `LoginPage`, not the fixture. Call it
  once per independent "actor" a test needs (e.g. twice for a
  cross-household authorization test).
- **`apiContext()`** — returns `{ apiRequestContext }`. Purely creates an
  API request context. Login (`POST /auth/login`) is a call you make
  through it, not something the fixture does automatically.
- Both fixtures track every context they create internally and dispose/
  close all of them in cleanup, regardless of how many a test requested.
- To log in during a UI test: `const loginPage = new LoginPage(session);
  await loginPage.login(TestData.someUser);`

## Types

Types are not declared inline in page objects, fixtures, or test files.
Shared types live in dedicated type files, and page-object constructor
parameter types are imported, never redeclared:

- `helpers/types.ts` — context/fixture types (`ApiContext`, `UIContext`,
  `Fixtures`). **New page object or fixture types go here.**
- `src/types.ts` — `ControlFinder`, used by the `Grid` family.
- `helpers/testUser.ts` — `TestUser`, `Role`, `testData`, kept next to the
  `TestData` values they describe.

A page object's session parameter is typed `UIContext`, imported from
`helpers/types`. `helpers/fixtures.ts` exports only the `test`/`expect`
objects and the `apiContext`/`uiContext` fixtures — no types. Importing a
session type from `helpers/fixtures` (e.g. a `UIExecutionContext`) is
wrong; that name does not exist.

The one exception is `Grid`'s constructor config object, which is declared
inline in `Grid.ts`.

## Grid — how tables are modeled

Tables are modeled as a strict hierarchy: `Grid` → `GridRow[]` →
`GridColumn[]`. A row's `.column` property is an array of `GridColumn`s in
header order (not looked up by name). Each `GridColumn` has `.getText()`
and a `.controls` array (also a plain array, not name-keyed) — populated
by running every registered `controlFinder` against that column's cell,
so a column with a link and a checkbox reports both, a column with
nothing reports an empty array.

```typescript
const table = new AccountsTable(session);
const rows = await table.rows();
const name = await rows[0].column[0].getText();
await rows[0].column[3].controls[0].click(); // e.g. the Edit button
```

A subclass only needs to provide `containerSelector` and
`controlFinders` (an array of `(cell: Locator) => Locator` functions —
each one is checked against every column; it's fine for a finder to match
nothing in a given cell).

Every real table in the frontend has a `data-testid` on its
`TableContainer` (e.g. `data-testid="accounts-table"`) — added
specifically to support these locators. If a new table is built in the
frontend without one, that's a gap to flag, not something to work around
with a fragile CSS/text selector.

## Test data

- `TestData` in `helpers/testUser.ts` holds the fixed identities (`admin`,
  `householdAUser1`, `householdAUser2`, `householdBUser1`), each with
  `{ email, password, role, name?, householdName? }`, loaded from env vars.
- These identities are **not seeded by a standalone script**. The act of
  registering a new household (or joining one) and having it
  approved/rejected via the real UI is itself the coverage for household
  onboarding. Other tests build on top of identities that already exist
  because an onboarding test created and approved them.
- Test cleanup goes through `helpers/db.ts`, using raw `pg` queries, not
  Prisma. Deleting a `User` requires deleting its `RefreshToken` rows
  first (foreign key is `RESTRICT`, and refresh tokens are never deleted
  by the application itself — only ever marked `revoked`). If a test also
  creates accounts/transactions/other entities, check for the same class
  of foreign-key ordering issue before assuming a blanket delete will work.
- A test that stops at the *pending* stage of onboarding leaves no `User`
  or `Household` row behind, so `deleteTestUser`/`deleteTestHousehold`
  clean up nothing — use `deletePendingHouseholdRequest(email)` as well,
  or the pending request survives into the next run and the re-submission
  may be rejected as a duplicate.

## Tagging

Use the object form for tags, not embedding them in the title string:
```typescript
test("some test name", { tag: "@regression" }, async ({ uiContext }) => { ... });
```

## Conventions for adding new tests/page objects

- Page objects and `Grid` subclasses take the whole session context
  object (`UIContext`) in their constructor, never a bare `Page`.
- A page object owns its own navigation — `RegisterPage.navigate()`,
  `LoginPage.goto()`. Don't call `page.goto()` from a test.
- A page object gets a navigation method only if the app actually needs
  one to reach that page. Login is the landing step for both post-auth
  pages, so neither has a `goto()`:
  - member/owner login → household dashboard. Construct
    `DashboardPage(session)` after `LoginPage.login()` and assert.
  - admin login → admin page. Construct `AdminPage(session)` and assert.

  `LoginPage` and `RegisterPage` keep their navigation because they are
  the entry points — that's what a test has to navigate *to*.
- Locate table rows by cell *content* rather than a hardcoded column
  index when the column order hasn't been verified against the real
  frontend; an index-based lookup that silently reads the wrong column is
  worse than a slightly longer content match.
- Don't use an `async` callback as a `find()`/`filter()` predicate — it
  returns a Promise, which is always truthy, so the match never actually
  filters anything.
- Every `Add*`/`Edit*` dialog in the real frontend resets its fields on
  Cancel, not just on success — if a page object wraps one of these
  dialogs, its Cancel action should be tested the same way, not just the
  happy path.
- Prefer `getByRole`/`getByLabel`/`getByTestId` over CSS selectors or raw
  text matching.
- New backend/frontend features built specifically to unblock a test (e.g.
  an admin-facing pending-requests page) are real product features, not
  test-only scaffolding — build them to the same standard as the rest of
  the app.
