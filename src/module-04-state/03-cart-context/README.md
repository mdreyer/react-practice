# 4.3 Cart Context (split state and actions)

**Difficulty:** Intermediate+ · **Suggested time:** 30 minutes
**Skills:** Context + `useReducer`, custom hooks that guard against a missing provider, stable context values, avoiding unnecessary re-renders

## The ticket

> The cart is needed everywhere: the header badge, the product tiles' "Add to cart" buttons, the cart drawer, and checkout.
> Build a `CartProvider` with two hooks. The marketplace page renders hundreds of "Add" buttons,
> so **components that only *change* the cart must not re-render when the cart changes.**

You'll edit `CartContext.tsx`.

## Requirements

### API
```tsx
<CartProvider initialLines={[]}>...</CartProvider>

const { lines, itemCount, totalCents } = useCart();                     // state
const { addItem, removeItem, setQuantity, clear } = useCartActions();   // actions only
```

### Behavior
1. `addItem(product, quantity = 1)`: adds a line, or increases the quantity of an existing line with the same `sku`.
   Lines stay in the order they were first added.
2. `setQuantity(sku, quantity)`: sets the quantity. `0` or less removes the line.
3. Quantities never go above `MAX_QUANTITY` (99), whether through `addItem` or `setQuantity`.
4. `removeItem(sku)` and `clear()` do what their names say.
5. `itemCount` (the sum of quantities) and `totalCents` are **calculated**, not stored.
6. Calling either hook outside a `CartProvider` throws an `Error` with the message
   `useCart must be used within a CartProvider` (or `useCartActions must be used within a CartProvider`).

### Performance
7. **The actions object is stable:** the same object every render, even after the cart changes.
8. **A component that only calls `useCartActions()` does not re-render when the cart contents change.**
   (Hint: one context or two?)

## Run the tests

```bash
npx vitest src/module-04-state/03-cart-context
```

## Be ready to answer out loud

- Why does putting `{ state, actions }` in **one** context value re-render every consumer on every change, even
  if you `useMemo` the value?
- Why do the tests pass `children` from outside the provider, and why does that matter for re-renders?
- When would you reach for Zustand, Redux Toolkit or Jotai instead of Context? What's `useSyncExternalStore`'s role there?
- Cart state usually belongs on the server (and in `localStorage` for guests). Where does this context fit then?
