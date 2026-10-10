# 4.1 Checkout as a State Machine (reducer)

**Difficulty:** Intermediate+ · **Suggested time:** 30 minutes
**Skills:** discriminated-union state, pure reducers, valid and invalid transitions, idempotency keys

## The ticket

> Checkout is a classic source of "impossible state" bugs: a spinner and an error at once, double charges from
> double clicks, a "Back" button that works mid-payment. Model checkout as an explicit state machine in a pure
> reducer. 4.2 will put a UI on top of it.

You'll edit `checkoutReducer.ts`. The state and action types are already written. Read them first, because the types
*are* the design.

## The state machine

```
details ──next──▶ payment ──next──▶ review ──submit──▶ submitting ──submitSucceeded──▶ succeeded
        ◀──back──         ◀──back──   ▲                    │  ▲
                                      │ back  submitFailed │  │ retry
                                      │                    ▼  │
                                      └──────────────────  failed
```
(`details`, `payment` and `review` are all `status: 'editing'`, with a different `step`.)

## Requirements

1. `isDetailsValid(details)`: `email` looks like an email (`something@something.something`, no spaces), and `country` isn't empty.
2. `checkoutReducer(state, action)` handles these transitions:

| Action | Allowed when | Result |
|---|---|---|
| `updateDetails` | editing, step `details` | merge `changes` into `details` |
| `selectPayment` | editing, step `payment` | set `payment` |
| `next` | editing `details` **and details are valid** | step → `payment` |
| `next` | editing `payment` **and a payment method is chosen** | step → `review` |
| `back` | editing `payment` / `review` | step → `details` / `payment` |
| `back` | `failed` | editing, step `review` (keep the details and payment) |
| `submit` | editing `review` (with a payment method) | `submitting`, storing `action.idempotencyKey` |
| `submitSucceeded` | `submitting` | `succeeded`, storing `orderId` |
| `submitFailed` | `submitting` | `failed`, storing `error` and **keeping the same idempotency key** |
| `retry` | `failed` | `submitting`, **with the same idempotency key** |

3. **Any action that isn't allowed in the current state is ignored: return the exact same state object.** (This alone
   prevents double submits.)
4. Never mutate the state. The tests freeze it.
5. Use a `switch` on `action.type` that is exhaustive (a `never` check), so adding an action type later is a compile error until it's handled.

## Run the tests

```bash
npx vitest src/module-04-state/01-checkout-reducer
```

## Be ready to answer out loud

- What's an **idempotency key**, and why must `retry` reuse it rather than generate a new one? What does the C# API do with it?
- Why return the *same object* for ignored actions, instead of `{ ...state }`?
- Where does the idempotency key get generated, and why not inside the reducer? (Hint: reducers must be pure.)
- `useReducer` vs `useState` vs XState: when would you reach for each?
