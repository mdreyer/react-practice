# React + TypeScript practice

A practice repo for React and TypeScript. Each module adds a folder under `src/`.
Each problem comes with a ticket-style spec (`README.md`), a starter file, and a test suite that tells you when you're done.

## Setup (about 5 minutes, one time)

**Recommended: GitHub + StackBlitz** (nothing to install, and your work is saved):

1. Create a new **public** GitHub repo, for example `react-practice`.
2. On the repo page, click **Add file → Upload files**, drag in **everything inside this folder**
   (including `package.json` and `src/`), and commit.
3. Open `https://stackblitz.com/github/<your-username>/react-practice`.
   StackBlitz installs the dependencies automatically. Click **Fork** so you can save your edits.
4. In the StackBlitz terminal:
   ```bash
   npx vitest src/module-01-warmup      # tests rerun every time you save
   ```
   Open a second terminal tab and run `npm run dev` if you want to click around the playground UI.

When new modules arrive, upload the new `src/module-XX-...` folder to your fork the same way.

**Fallback: run locally** (needs Node 20+): `npm install`, then `npx vitest src/module-01-warmup`.

## How to work a problem

1. Read the problem's `README.md`. Start a timer for the suggested time.
2. Turn **AI autocomplete off** (check the editor settings in StackBlitz). Ordinary IntelliSense is fine.
3. Get the tests green. Then answer the "Be ready to answer out loud" questions **out loud**.
4. Paste your component into the chat with Claude for a review.
5. Once a day, redo one problem from scratch in a **plain editor** (the CoderPad sandbox or HackerRank's React
   environment) with no tests.

## Roadmap

| Day | Module | Focus |
|---|---|---|
| 1 | **1. Warm-up** | State, forms, lists, keys, bug hunt |
| 2 | **2. Hooks in depth** | Effects, cleanup, stale closures, race conditions, custom hooks |
| 3 | **3. TypeScript** | Generics, discriminated unions, narrowing, C#-shaped DTOs |
| 4 | **4. State & architecture** | Checkout as a state machine, reducers, context, URL state |
| 5 | **5. API integration (C#)** | Typed client, ProblemDetails errors, retries, idempotency, optimistic UI |
| 6 | **8. Accessibility** | Dialog focus management, ARIA patterns, live regions, keyboard grids |
| 7 | **10. Security** | XSS, open redirects, CSRF/antiforgery, token storage, CSP |
| 8 | **9. Internationalization** | `Intl`, plurals, RTL, string externalization |
| 9 | **6. Modern React 19** | Actions, `useActionState`, `useOptimistic`, `use()`, transitions |
| 10 | **7. Performance** | Memoization, virtualization, code-splitting, profiling |
| 11 | **11. Component library** | Compound components, polymorphism, API design |
| 12 | Testing | |

Every module includes **about 15 minutes of quick-fire JS/browser fundamentals** (`QUICKFIRE.md`) to rehearse technical conversation topics.
