# 3.3 A Typed API Client

**Difficulty:** Advanced · **Suggested time:** 35 minutes
**Skills:** generics constrained by `keyof`, indexed access types, conditional types with `infer`, rest-tuple parameters, custom `Error` classes

## The ticket

> Every page on the account site calls `fetch` by hand, with the URL, method, headers and response type
> copied around. Build one small typed client: you give it a route name, and TypeScript knows whether a body
> is required, what shape it must be, and what comes back.

You'll edit `apiClient.ts`. The `ApiRoutes` map describes the C# API's endpoints. Your job is to make
`client.request(...)` fully type-safe, and to implement it.

```ts
const client = createApiClient(fetch, 'https://api.minecraft.example');
const profile = await client.request('GET /api/profile');               // → Profile
const order = await client.request('POST /api/orders', { bundleId: 'explorer', quantity: 2 }); // → OrderConfirmation
client.request('POST /api/orders');           // ❌ compile error: body required
client.request('GET /api/profile', {});       // ❌ compile error: GET takes no body
```

## Requirements

### Types (checked by `npm run typecheck:m3`)
- `ResponseOf<K>`: the `response` type for route `K`.
- `BodyArgs<K>`: `[body: TheBodyType]` if route `K` has a `body`, otherwise `[]`. Use this as the **rest
  parameter** type of `request`, so the body argument is required, or forbidden, depending on the route.
- `request<K extends RouteKey>(route: K, ...args: BodyArgs<K>): Promise<ResponseOf<K>>`

### Runtime (checked by Vitest)
1. Split the route key into method and path (`'POST /api/orders'` → `POST`, `/api/orders`) and call
   `fetchImpl(baseUrl + path, init)`.
2. Always send the header `Accept: application/json`. When there's a body, also send
   `Content-Type: application/json` and `JSON.stringify` it.
3. Status **204** resolves to `null`. Other successful (2xx) responses resolve to `await res.json()`.
4. For a non-2xx status, throw an `ApiError` (already declared) with `.status` set, and `.problem` set to the parsed
   JSON body if there is one. (ASP.NET Core returns errors as RFC 9457 "problem details": `{ title, status, detail }`.)
   The error `message` should be the problem's `title` when present, otherwise `Request failed with status {status}`.
5. Network failures (when `fetchImpl` itself rejects) should be passed through unchanged.

## Run the tests

```bash
npx vitest src/module-03-typescript/03-api-client
npm run typecheck:m3
```

## Be ready to answer out loud

- Why is `...args: BodyArgs<K>` better than `body?: Body` here?
- What does `infer` do in a conditional type? Write a tiny `ElementOf<T>` with it.
- Why `class ApiError extends Error` instead of throwing a plain object? What does `instanceof` give callers?
- In a real app, where would you get these route types from, so they can't drift from the C# backend?
  (Hint: OpenAPI / Swagger, NSwag, or `openapi-typescript`.)
