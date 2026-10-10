# 3.2 Parse, Don't Validate: Order DTOs from the C# API

**Difficulty:** Intermediate+ · **Suggested time:** 35 minutes
**Skills:** narrowing from `unknown`, type guards, `Result` types, the quirks of C# JSON

## The ticket

> The order history page calls `GET /api/orders/{id}` on our ASP.NET Core API. Right now the frontend
> does `const order = (await res.json()) as Order`, which tells TypeScript "trust me." Last week a
> backend change sent `status` as a number instead of a string, and the page broke in production.
> Replace the cast with a real parser that turns `unknown` JSON into a typed `Order`, or a clear error.

You'll edit `parseOrder.ts`. **No `any`, no `as Order`, and no validation libraries.** (Be ready to talk about Zod, though.)

## The API contract (what the C# side actually sends)

```jsonc
{
  "orderId": "9007199254740993",      // C# long, sent as a STRING (bigger than Number.MAX_SAFE_INTEGER)
  "status": 1,                         // C# enum OrderStatus, sent as a NUMBER: 0 Pending, 1 Paid, 2 Fulfilled, 3 Refunded
  "createdAt": "2026-10-09T17:30:00Z", // DateTimeOffset, ISO 8601 string
  "total": 19.98,                      // C# decimal, in DOLLARS
  "currency": "USD",
  "lines": [
    { "sku": "MC-1720", "name": "1,720 Minecoins", "quantity": 2, "unitPrice": 9.99 }
  ],
  "promoCode": null                    // string? (nullable), and may also be missing
}
```

## Requirements

`parseOrder(json: unknown): ParseResult<Order>` returns `{ ok: true, value }` or `{ ok: false, error }`.

Field rules. Check them **in this order**, and return the **first** problem:

| Field | Rule | Becomes |
|---|---|---|
| (root) | must be a non-null object (not an array) | — |
| `orderId` | a non-empty string of digits | `id` (keep it a string!) |
| `status` | an integer 0–3 | `'pending' \| 'paid' \| 'fulfilled' \| 'refunded'` |
| `createdAt` | a string that parses to a valid date | `Date` |
| `total` | a finite number ≥ 0 | `totalCents` (integer, use `Math.round(total * 100)`) |
| `currency` | exactly 3 uppercase letters | `currency` |
| `lines` | a **non-empty** array | `lines` |
| `lines[i].sku` | a non-empty string | `sku` |
| `lines[i].name` | a string | `name` |
| `lines[i].quantity` | a positive integer | `quantity` |
| `lines[i].unitPrice` | a finite number ≥ 0 | `unitPriceCents` |
| `promoCode` | a string, `null`, or missing | `promoCode` when it's a string. **Leave the key out entirely** otherwise |

Then one business rule: `totalCents` must equal the sum of `quantity × unitPriceCents`. If it doesn't, return an
error that contains `does not match`.

**Error messages must include the path** of the bad field, such as `status` or `lines[1].quantity`. Ignore unknown extra fields.

## Run the tests

```bash
npx vitest src/module-03-typescript/02-parse-order
```

## Be ready to answer out loud

- Why is `orderId` a string? What happens to `9007199254740993` if you `JSON.parse` it as a number?
- ASP.NET Core sends enums as numbers by default. What backend setting would send `"Paid"` instead, and which do you prefer?
- Why convert `decimal` dollars to integer cents at the boundary, rather than deep in the UI?
- How would Zod (or Valibot) change this file? What would you gain, and what does it cost in bundle size?
- "Parse, don't validate": what does that phrase mean?
