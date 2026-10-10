# 3.4 A Generic React Component

**Difficulty:** Intermediate · **Suggested time:** 20 minutes
**Skills:** generic components, type inference from props, `ReactNode`, generic syntax in `.tsx` files

## The ticket

> We have four nearly identical "pick one from a list" components (bundles, Realms, skins, payment methods).
> Replace them with a single generic `SelectableList<T>` for the shared component library.

You'll edit `SelectableList.tsx`.

## Requirements

### Types
- `SelectableList` is generic over the item type `T`, and **`T` is inferred from `items`**, so no one ever writes
  `<SelectableList<Bundle> ...>`.
- `onSelect` receives a `T` (the original item object), with no casting at the call site.
- No `any`.

Props (already listed in `SelectableListProps`, but not generic yet):

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | accessible name for the list |
| `items` | `readonly T[]` | |
| `getKey` | `(item: T) => string` | used for the React `key` and for selection |
| `getLabel` | `(item: T) => string` | the default button content |
| `renderItem?` | `(item: T) => ReactNode` | custom button content (falls back to `getLabel`) |
| `selectedKey` | `string \| null` | |
| `onSelect` | `(item: T) => void` | |
| `emptyMessage?` | `string` | defaults to `No items.` |

### Behavior
1. Render a `<ul aria-label={label}>` with one `<li>` per item. Inside each `<li>` goes a `<button type="button">`
   showing `renderItem(item)`, or `getLabel(item)` when there's no `renderItem`.
2. The selected item's button has `aria-pressed="true"`, and every other button has `aria-pressed="false"`.
3. Clicking a button calls `onSelect` with **the same item object** that came from `items`.
4. With no items, render `<p>{emptyMessage}</p>` instead of the list.

## Run the tests

```bash
npx vitest src/module-03-typescript/04-generic-list
```

(Until your component is generic, the test file shows red type errors, such as `b` being `unknown`. That's your type test. Vitest strips types without checking them, so check your types in the editor. Hover over `item` in the
`onSelect` callback in `main.tsx` or the test file, and make sure it shows `Bundle` / `Friend`, not `unknown`.)

## Be ready to answer out loud

- In a `.tsx` file, why does `const List = <T>(props: Props<T>) => ...` fail to parse? Name two fixes.
- How does TypeScript infer `T` here? What happens if `items` is an empty array literal `[]`?
- Stretch: how would you make `getKey` optional **only** when `T` has an `id: string` property?
- Is `aria-pressed` toggle buttons the right pattern here, or should this be a radio group or a `listbox`?
  What changes for keyboard users? (Module 8 comes back to this.)
