# Module 4 Quick-Fire (about 15 minutes, out loud)

**1. `useState` vs `useReducer`: when do you switch?**
<details><summary>Answer</summary>

Switch to `useReducer` when the next state depends on the previous one in non-trivial ways, when several values change together,
or when you want the transitions named, tested and centralized (checkout!). A reducer is a pure function, so you can
unit-test it without React, as in 4.1. For one or two independent values, stay with `useState`.
</details>

**2. What's "prop drilling," and what are your options besides Context?**
<details><summary>Answer</summary>

Passing props through components that don't use them. Options: **composition** (pass `children` or elements down,
often the best fix), co-locating state lower in the tree, Context, or an external store (Zustand, Redux Toolkit, Jotai).
Drilling through two or three levels is fine, and explicit.
</details>

**3. Why can Context cause performance problems, and how do you mitigate them?**
<details><summary>Answer</summary>

Every consumer re-renders whenever the provider's `value` changes, by reference. Mitigations: memoize the value, **split
contexts** (state vs. actions, or by how often things change, as in 4.3), keep frequently changing state out of Context,
or use a store with selectors (`useSyncExternalStore` underneath).
</details>

**4. What is "derived state," and what's the bug pattern?**
<details><summary>Answer</summary>

Values you can calculate from other state or props. The bug pattern is *storing* them (copying a prop into state, syncing it with
an effect), which means two sources of truth that drift apart. Calculate during render instead, and `useMemo` only if it's expensive.
This came up in 1.2, 1.3 and 2.4.
</details>

**5. What does "make impossible states impossible" mean, concretely?**
<details><summary>Answer</summary>

Model state as a **discriminated union**, so invalid combinations can't be written:
`{ status: 'success', data }` and `{ status: 'error', error }`, rather than `{ isLoading, isError, data, error }`
(which allows 16 combinations, most of them nonsense). Checkout in 4.1 can't be "submitting" with no payment method,
because the type doesn't allow it.
</details>

**6. What's an idempotency key?**
<details><summary>Answer</summary>

A unique id the client generates **per purchase attempt** and sends with the request (often in an
`Idempotency-Key` header). The server stores the result under that key, and a repeat request with the same key returns the
stored result instead of charging again. Generate it once per attempt (in the event handler, not in render or a reducer),
and **reuse it on retry**.
</details>

**7. Server state vs. client state: why do people treat them differently?**
<details><summary>Answer</summary>

Server state is owned remotely, can go stale, is shared with other tabs and devices, and needs caching, refetching,
deduplication and invalidation. Client state is owned by the UI. Libraries like TanStack Query handle server state, so your
own state code only has to deal with the UI part.
</details>

**8. How do you manage focus in a multi-step flow or SPA navigation, and why?**
<details><summary>Answer</summary>

When the content changes without a page load, screen-reader and keyboard users get no signal, and focus may sit on
a button that no longer exists. Move focus to the new view's heading (`tabIndex={-1}` plus `.focus()`), and/or
announce the change in a live region. Don't do it on the first render. Routers often have a hook for this. (Module 8 goes deeper.)
</details>

**9. What belongs in the URL?**
<details><summary>Answer</summary>

Anything a user would expect to **share, bookmark, refresh into, or go Back from**: search, filters, sort, pagination,
the selected tab or item. Not secrets, tokens or personal data (URLs end up in logs, history and referrer headers). Treat URL values
as untrusted input, and validate them before use.
</details>

**10. How would you structure a large React feature (say, the whole account area)?**
<details><summary>Answer</summary>

Group by **feature**, not by file type (`features/checkout/{components,hooks,api,model}`), keep pure domain logic
(reducers, parsers, formatting) free of React so it's easy to test, put an API layer between the components and `fetch`
(3.3), use shared UI primitives from the design system, and set clear boundaries: route-level code splitting, an error boundary per
feature, and one owner per piece of state.
</details>
