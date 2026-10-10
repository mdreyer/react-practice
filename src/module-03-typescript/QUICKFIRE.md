# Module 3 Quick-Fire (about 15 minutes, out loud)

Answer each in 30–60 seconds **before** opening the answer.

**1. `unknown` vs `any` vs `never`?**
<details><summary>Answer</summary>

`any` switches type checking off, in both directions. `unknown` is the safe "could be anything": you must narrow it
before you use it (that's what JSON from an API should be). `never` is the type with no values: it's what a function that
always throws returns, it's what's left after exhaustive narrowing, and it's the empty union.
</details>

**2. `type` vs `interface`?**
<details><summary>Answer</summary>

They overlap almost completely for object shapes. `interface` supports **declaration merging** (augmenting library
types, like adding to `Window`) and `extends`, which gives somewhat clearer errors. `type` is needed for unions, tuples,
mapped and conditional types, and primitives. Many teams default to `type`, using `interface` for public, extendable
object contracts. Consistency matters more than the choice.
</details>

**3. What does `satisfies` do that `const x: T = ...` doesn't?**
<details><summary>Answer</summary>

An annotation **widens** the value to `T` (you lose the literal types). `satisfies T` **checks** the value against
`T` but keeps the narrower inferred type. Combined with `as const`, you get validated config with exact literal types,
like `LocaleCode` in 3.1.
</details>

**4. What is a discriminated union, and why are they great for UI state?**
<details><summary>Answer</summary>

A union of object types that share a literal "tag" field (`status: 'loading' | 'success' | 'error'`). Checking the
tag narrows to the matching member, so `data` only exists in the success branch. They make impossible states
impossible to write (no `isLoading && error && data` combinations), and a `never` check makes switches exhaustive. Module 4
builds checkout on this.
</details>

**5. Type assertions (`as`) vs type guards: when is `as` acceptable?**
<details><summary>Answer</summary>

`as` is a promise to the compiler with no runtime check. That's fine when you know something the compiler can't
(the type of an element from `querySelector`, `as const`, tests). A **type guard** (`(v: unknown): v is Order`) narrows *after* a
runtime check. At trust boundaries (API responses, `localStorage`, `postMessage`, URL params), check at runtime. 3.2 is exactly this.
</details>

**6. What are generics *for*? Give a one-line example of a constraint.**
<details><summary>Answer</summary>

They keep the relationship between input and output types, without committing to one specific type: `first<T>(xs: T[]): T | undefined`.
A constraint limits which types are accepted: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K]`.
</details>

**7. What does `keyof typeof SOMETHING` give you, and when would you use it?**
<details><summary>Answer</summary>

`typeof` gets the type of a *value*, and `keyof` turns that type's keys into a union of string literals. So
`keyof typeof ERROR_MESSAGES` gives a union of valid error codes, derived from the object itself, so the
two can never drift apart.
</details>

**8. How do you type React props, children, events, and refs?**
<details><summary>Answer</summary>

Props: `type Props = { ... }` with `function Comp({ a }: Props)` (most teams have moved away from `React.FC`). Children:
`children: ReactNode`. Events: `(e: React.ChangeEvent<HTMLInputElement>) => ...` (or inline handlers infer it).
Extending native props: `ComponentProps<'button'>` or `ButtonHTMLAttributes<HTMLButtonElement>`. Refs in React 19:
`ref` is a normal prop, typed `Ref<HTMLButtonElement>` (no `forwardRef` needed).
</details>

**9. What are `Partial`, `Required`, `Pick`, `Omit`, `Record`, `ReturnType`, `Awaited`, `NonNullable`?**
<details><summary>Answer</summary>

`Partial` makes every prop optional, and `Required` makes them all required. `Pick` keeps the listed keys, and `Omit` removes them.
`Record<K, V>` builds an object type with keys `K` and values `V`. `ReturnType<typeof fn>` is what a function returns.
`Awaited<T>` unwraps a promise. `NonNullable<T>` removes `null` and `undefined`. They're all built from mapped and conditional types, the same tools you used in 3.1.
</details>

**10. The C# backend adds a field or renames one. How do you stop the frontend types from silently drifting?**
<details><summary>Answer</summary>

Generate the types from the API contract. ASP.NET Core can publish an **OpenAPI** document (Swashbuckle, NSwag, or the built-in
OpenAPI support), and tools like `openapi-typescript` or NSwag generate TypeScript from it, run in CI so a contract change
fails the build. Then validate at runtime at the boundary (3.2 or Zod) for whatever the types can't guarantee.
</details>
