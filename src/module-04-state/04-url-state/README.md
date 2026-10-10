# 4.4 Filters in the URL (`useQueryParam`)

**Difficulty:** Advanced · **Suggested time:** 35 minutes
**Skills:** treating the URL as state, `URLSearchParams`, `history.pushState` / `replaceState`, `popstate`, `useSyncExternalStore` (again!)

## The ticket

> Players share Marketplace links in Discord ("look at these creeper skins!"), but our filters live in React state,
> so the link always opens an unfiltered page, and the Back button doesn't undo a filter change. Move the
> search, sort and page into the query string.

You'll edit `useQueryParam.ts` (the hook) and `MarketplaceFilters.tsx` (a component that uses it).
No router library: the browser APIs are enough, and knowing them makes you better with React Router or Next.js.

## Requirements

### `useQueryParam(key, defaultValue = '')` → `[value, setValue]`
1. `value` is the param's current value in `window.location.search`, or `defaultValue` when the param is absent.
2. `setValue(next, { replace })` updates the URL:
   - sets the param, or **removes** it when `next` equals `defaultValue` or `''` (keep URLs clean)
   - **keeps all other params** (and the path and hash) exactly as they were
   - uses `history.pushState` by default, or `history.replaceState` when `{ replace: true }`
3. **Every** component using the hook re-renders after `setValue`, even components watching a *different* key.
   Note that `pushState` does **not** fire any event by itself.
4. The browser's Back and Forward buttons (the `popstate` event) update every component using the hook.
5. Cleans up its listeners on unmount.
6. Build it on `useSyncExternalStore`. The URL is an external store, just like `navigator.onLine` was in 2.3.

### `MarketplaceFilters`
| Control | Param | Default | Notes |
|---|---|---|---|
| `<input type="search">` labelled `Search` | `q` | `''` | Update with **`replace: true`** so typing doesn't add a history entry for every keystroke |
| `<select>` labelled `Sort by`: `Most popular` (`popular`), `Newest` (`newest`), `Price: low to high` (`price-asc`) | `sort` | `popular` | push |
| `Previous page` / `Next page` buttons | `page` | `1` | push. `Previous page` is disabled on page 1 |

And a summary line, in a `<p>`:
- with a search: `Showing "creeper" sorted by Newest, page 2`
- without one: `Showing all skins sorted by Most popular, page 1`

## Run the tests

```bash
npx vitest src/module-04-state/04-url-state
```

## Be ready to answer out loud

- When should a piece of state live in the URL, in React state, in `localStorage`, or on the server?
- Why `replaceState` for typing but `pushState` for sort and page changes? What would Back feel like otherwise?
- Why doesn't `pushState` fire `popstate`, and how did you make other components notice the change?
- A param value comes from the URL, so anyone can craft it. What could go wrong if you rendered or `eval`ed it unsafely,
  or passed `sort` straight into an API query? (This leads into Module 10.)
