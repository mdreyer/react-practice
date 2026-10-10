# 4.2 Checkout Wizard UI

**Difficulty:** Advanced · **Suggested time:** 45 minutes
**Skills:** `useReducer` with your 4.1 reducer, multi-step forms, focus management, async submission, preventing double submits

> **Do 4.1 first.** This component imports `checkoutReducer` from `../01-checkout-reducer`, so these tests depend on your reducer being correct.

## The ticket

> Build the Minecoins checkout wizard on top of the checkout state machine: details → payment → review → place order.
> It has to be fully keyboard and screen-reader friendly, and it must never charge a player twice.

You'll edit `CheckoutWizard.tsx`.

## Requirements

**Structure**
1. Drive everything with `useReducer(checkoutReducer, initialCheckoutState)`. Don't add parallel state for the step or status.
2. **Progress indicator:** an `<ol aria-label="Checkout progress">` with three `<li>`s: `Details`, `Payment`, `Review`.
   The current step's `<li>` has `aria-current="step"`. While submitting or failed, `Review` is the current step.
3. **Step heading:** each screen has an `<h2>`: `Your details`, `Payment method`, `Review your order`, or `Thank you!`.
4. **Focus management:** when the screen changes, move keyboard focus to the new `<h2>` (give it `tabIndex={-1}`).
   **Don't** steal focus on the very first render.

**Screens**
| Screen | Contents |
|---|---|
| Details | `Email` input (`type="email"`), and a `Country` select with options `Select a country` (value `''`), `United States` (`US`), `Germany` (`DE`), `Japan` (`JP`), `Brazil` (`BR`). A `Continue to payment` button, disabled until `isDetailsValid`. |
| Payment | A `<fieldset>` with legend `Choose a payment method` and radios `Card` (`card`), `PayPal` (`paypal`), `Gift card` (`giftCard`). Buttons `Back` and `Continue to review` (disabled until a method is chosen). |
| Review | Shows the email, the country **name**, and the payment method **label**. Buttons `Back` and `Place order`. |
| Submitting | The review screen, but `Place order` reads `Placing order…`, and both buttons are disabled. |
| Failed | The review screen plus an element with `role="alert"` reading `Payment failed: {error}`, and buttons `Try again` and `Back`. |
| Succeeded | `Thank you!` heading, and `Order {orderId} confirmed.` |

**Submitting**
5. `Place order`: create a key with `createIdempotencyKey()` (the prop defaults to `crypto.randomUUID`), dispatch
   `submit`, then call `submitOrder({ details, payment, idempotencyKey })`. Dispatch `submitSucceeded` with the
   returned `orderId`, or `submitFailed` with the error's `message` (or `Something went wrong` if it isn't an `Error`).
6. `Try again` re-calls `submitOrder` with the **same** idempotency key. Don't create a new one.
7. Clicking `Place order` twice must call `submitOrder` only once.

## Run the tests

```bash
npx vitest src/module-04-state/02-checkout-wizard
```

## Be ready to answer out loud

- Why call `submitOrder` from the **event handler** rather than from a `useEffect` that watches for `status === 'submitting'`?
  (Hint: what does StrictMode do to effects in development?)
- Why move focus to the heading on step change? What does a screen-reader user experience if you don't?
- What if the component unmounts while `submitOrder` is still running? What would you do about it?
- The server is the real guard against double charges. What does the C# endpoint do with the idempotency key?
