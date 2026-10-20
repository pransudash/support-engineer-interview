# Interviewer guide

## Preparation

Run `npm ci`, `npx playwright install chromium`, `npm test`, and `npm run typecheck` on a clean clone. The demo health suite should pass. The separate challenge suite intentionally fails with Not implemented until the candidate fills in the functions. Do not ask the candidate to build or fix the demo during the timed exercise.

Give the candidate the README, a forkable repository URL, and a few minutes to verify the setup. Allow Playwright documentation. Agree on your AI-assistance policy before starting. For a 60-minute session, use 20 minutes for lookup, 30 minutes for the follow-up, and 10 minutes for discussion; completing every follow-up scenario is a stretch goal.

This guide and all acceptance tests are visible to candidates. There is no hidden answer key or completed solution in this repository. The demo's own smoke tests necessarily show basic UI interactions, but do not implement lookup selection or resilient rescheduling. Evaluate their reasoning and implementation, not memorization of API syntax.

## Rubric (20 points)

- Correct lookup and patient identity (4): exact ID, status filtering, chronological selection, missing records.
- Reliable Playwright usage (4): scoped locators, observable waits, no stale ElementHandles or fixed sleeps.
- Mutation safety (6): exact appointment and slot, persisted verification, no duplicate save after ambiguous success, no substitution, explicit uncertainty.
- Diagnostics and maintainability (3): actionable errors, bounded behavior, readable helpers, useful artifacts.
- Tests and communication (3): meaningful extra coverage, clear tradeoffs, transparent limitations.

Ask: What if Save times out after the server committed? How would you recover after a process restart? What evidence would you give a support engineer? What would change with a real backend and concurrent users?

## Scope and limits

The page uses localStorage, not a server database. It intentionally has no authentication, PHI, backend integration, or production connectivity. The simulation does not cover genuine transport failures or concurrency. A reset is global within the browser context, so don't reset during an in-progress save. Every test runs in a separate context to prevent shared state collisions.

The supplied tests are a baseline, not a complete correctness proof. Review for hardcoding and inspect the candidate's added edge cases. Consider requesting a test for a missing appointment, an unavailable requested slot, or two upcoming appointments on the same day. Do not grade by pass count alone.

## Publishing

Publish only this standalone folder as a new repository. It contains no Shasta application dependencies. Do not publish the parent workspace. Choose public visibility for frictionless forking or configure private access for candidates. Git branches should follow `pransu/codex/{hyphenated-description}` when preparing this starter; candidates may follow your own submission policy.
