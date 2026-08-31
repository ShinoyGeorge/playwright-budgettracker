# Process: Generating Tests from a Jira Ticket

This is the end-to-end workflow to follow whenever the user gives you a
Jira ticket key and asks for test coverage. Follow every stage in order.
Do not skip a review checkpoint, even if a step seems small.

Read `docs/AUTOMATION.md` before Stage 4 — you need its conventions to
generate anything that fits the existing framework.

## Stage 0 — Ask for additional context

Before fetching anything, ask the user if there's any other context they
want to provide beyond the ticket key — e.g. related tickets, a specific
area of the app to focus on, known constraints, or anything else not
captured in the ticket itself. Wait for their answer (including "no,
nothing else") before moving to Stage 1.

## Stage 1 — Fetch the ticket

- Fetch the ticket via the Atlassian MCP connection using the key the
  user gave you.
- Pull its summary, description, and acceptance criteria. Jira has no
  universal format for ACs — they might be a dedicated field, a bulleted
  list under an "Acceptance Criteria" heading in the description, or
  something else. If you can't confidently identify the ACs, show the
  user the full description and ask them to point out which part is the
  ACs, rather than guessing.

## Stage 2 — Confirm scope with the user

- List the ACs you found, numbered.
- Ask the user which of these ACs they want test cases written for.
  Don't assume "all of them" — some ACs may already be covered, out of
  scope for automation, or not worth automating.
- Wait for their answer before moving on.

## Stage 3 — Draft test cases (plain English, not code yet)

- For each AC the user selected, write one or more test cases as
  Given/When/Then or clear step-by-step statements. No code at this
  stage.
- Present the drafted cases to the user and stop. Do not proceed until
  the user has explicitly approved, edited, or rejected each one.
- If the user edits a case, treat their edited version as the one to
  build from — don't silently revert to your original draft.

## Stage 4 — Create the approved test cases in AIO Tests

Only after Stage 3's cases are approved.

- Use the AIO Tests MCP connection to create the test cases — one AIO
  test case per approved scenario from Stage 3, using AIO's own test
  case schema (fetch it via "Get Test Case Schema" first if unsure of
  required/available fields).
- Before creating, check AIO's folder hierarchy ("Get Folder Hierarchy")
  for whether a folder already exists for this module/ticket. If one
  exists, use it. If not, ask the user where the cases should go — don't
  invent a new folder structure unprompted.
- Link each created test case back to the originating Jira ticket
  (AIO's requirement-linking, if the schema supports it) so traceability
  is visible from both sides.
- Confirm with the user which test cases were created (names/IDs from
  AIO) before moving on.
- Do not transition or close the Jira ticket unless the user explicitly
  asks.

## Stage 5 — Update module-specific documentation

- Update the relevant `docs/modules/<module>.md` to list the scenario(s) now
  covered, each referencing its AIO test case ID. If the module has no
  doc yet, create one containing only this.
- **A module doc is a plain list of covered scenarios — nothing else.**
  No status qualifiers ("written," "drafted," "not yet confirmed
  passing," etc.) — if a scenario is listed here, that means it is
  covered. No file paths, no page-object names, no AIO folder structure,
  no scope narration, no explanations of process. Any of that belongs in
  `AUTOMATION.md` instead.
- If you are not certain whether a scenario is genuinely covered (e.g.
  the test hasn't actually been confirmed passing yet), do not list it
  and do not guess — ask the user whether it counts as covered, and only
  add it once they confirm.
- This stage happens even if automation hasn't been generated yet.

## Stage 6 — Generate automation

Check `docs/AUTOMATION.md` and the existing `pages/` directory for
whether a page object already covers the screen(s)/elements this
scenario touches.
  - If yes: reuse it. Do not create a new page object or duplicate
    locators that already exist.
  - If no: create a new page object following the conventions in
    `docs/AUTOMATION.md` (constructor takes the whole session context,
    not a bare `Page`; types go in `helpers/types.ts`, not inline).
    Use clearly-marked placeholder locators for any element you can't
    verify against the real app — e.g.
    `page.getByTestId("TODO-confirm-selector")` — and list every
    placeholder explicitly in your response so the user knows exactly
    what needs a real locator before the test can pass.

Write the actual `.spec.ts` file, using the test cases created in AIO
Tests in Stage 4 as the source of truth for what to assert. Do not
invent scenario details that weren't in the approved test cases. If
something is ambiguous, ask rather than guess.

**Do not record open questions or unverified assumptions in any doc.**
If something about the real app (a route, a table's column order, a
schema field, what "not approved" looks like on screen) can't be
confirmed from what's already been discussed or from inspecting the
actual app/codebase, stop and ask the user directly, then proceed once
answered. A module doc should only ever describe confirmed, resolved
facts — never a running list of things still unverified.

## Stage 7 — Review the generated automation

- Present the generated test file (and any new page object) to the user.
- Stop and wait for explicit approval before doing anything further.
  Do not run the test or commit it yet.
- If the user requests changes, make them and return to this checkpoint
  — don't move on until they've approved the current version.

## Stage 8 — Update project docs

- Once automation is confirmed passing, add the scenario(s) to the
  module's `docs/modules/<module>.md` if they weren't already added in Stage 5
  (e.g. if Stage 5 held off because passing wasn't yet confirmed). Keep
  the file to a plain list of covered scenarios only — no status
  qualifiers, no extra detail — per Stage 5's rule.
- If a new page object, fixture, convention, or file location was
  introduced, update `docs/AUTOMATION.md` to describe it — this is where
  "where does this module's automation live" belongs, not the module doc.

## Things to never do in this flow

- Never skip Stage 0, Stage 2, Stage 3, or Stage 7's review checkpoints,
  even for a small/obvious change.
- Never generate automation (Stage 6) before the test cases have been
  created in AIO Tests (Stage 4).
- Never invent an AIO folder structure unprompted — ask if none exists
  for this module/ticket yet.
- Never invent a locator and treat it as real — placeholders must be
  clearly marked as placeholders.
- Never write an "open questions" or "unverified assumptions" section
  into a doc — ask the user and resolve it before writing anything down.
- Never put file paths, page-object names, or process/scope narration
  into a module doc — that belongs in `AUTOMATION.md`. A module doc is a
  plain list of covered scenarios, nothing else — no status qualifiers.
- Never list a scenario in a module doc unless you're certain it's
  genuinely covered — ask the user rather than guess or hedge.
- Never duplicate an existing page object instead of reusing it.
- Never update the Jira ticket or AIO test case status as part of this
  flow — this workflow does not report automation back to Jira/AIO.
