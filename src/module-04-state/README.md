# Module 4: State & Architecture (about 2.5 hours)

| # | Problem | Level | Time | Tests |
|---|---|---|---|---|
| — | [Quick-fire Q&A](./QUICKFIRE.md) | — | 15 min | (out loud) |
| 4.1 | [Checkout State Machine (reducer)](./01-checkout-reducer/README.md) | Intermediate+ | 30 min | 13 |
| 4.2 | [Checkout Wizard UI](./02-checkout-wizard/README.md) | Advanced | 45 min | 7 |
| 4.3 | [Cart Context (split state and actions)](./03-cart-context/README.md) | Intermediate+ | 30 min | 8 |
| 4.4 | [Filters in the URL](./04-url-state/README.md) | Advanced | 35 min | 8 |

```bash
npx vitest src/module-04-state
```

**Do 4.1 before 4.2.** The wizard imports your reducer.

**The thread through this module:** *where should this state live?*

| Kind of state | Home | Example |
|---|---|---|
| Server data | the server, with a client cache (TanStack Query, etc.) | balance, orders, cart for signed-in players |
| Shareable UI state | the URL | search, sort, page, selected tab |
| Shared client state | Context / an external store | cart drawer open, the in-progress checkout |
| Local UI state | `useState` / `useReducer` in the component | an input draft, hover, an open menu |
| Persistent preferences | `localStorage` (validated on read!) | theme, dismissed banners |
