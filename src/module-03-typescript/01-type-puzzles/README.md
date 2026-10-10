# 3.1 Type Puzzles

**Difficulty:** Intermediate → Advanced · **Suggested time:** 35 minutes
**Skills:** discriminated unions, exhaustiveness checks, mapped and conditional types, generics with `keyof`, `as const` and `satisfies`

This problem has **two kinds of tests**:

```bash
npx vitest src/module-03-typescript/01-type-puzzles   # runtime behavior
npm run typecheck:m3                                   # compile-time tests in *.types.ts files
```

`typecheck:m3` runs the TypeScript compiler over the `*.types.ts` files. A type test **passes when there are no errors**.
Each `// @ts-expect-error` line *must* produce an error. If your types are too loose, TypeScript reports
"Unused '@ts-expect-error' directive."

You'll edit `puzzles.ts`. Don't use `any`.

## Part A: Entitlements (discriminated union)

A player's library holds different kinds of entitlements. Implement `describeEntitlement` so it returns:

| kind | Output |
|---|---|
| `skinPack` | `Skin pack (12 skins)` / `Skin pack (1 skin)` |
| `world` | `World (350 MB)` |
| `minecoins` | `1,720 Minecoins` (formatted with `en-US`) |
| `realmsPlus` | `Realms Plus (expires 2026-12-31)`, using the UTC date in `YYYY-MM-DD` form |

Use a `switch` on `kind`, with a `default` branch that calls `assertNever(e)`. Then, if someone adds a new kind
to the union, the compiler points to every switch that doesn't handle it.

## Part B: Utility types

Replace each `TODO` type:

- `Optional<T, K>`: `T`, but with the keys in `K` made optional. For example, `Optional<Profile, 'bio' | 'avatarUrl'>`.
- `ValueOf<T>`: a union of all the property value types of `T`.
- `KeysOfType<T, V>`: a union of the keys of `T` whose value type is assignable to `V`.
  For example, `KeysOfType<Profile, string>` gives the string-valued keys.
- `DeepReadonly<T>`: makes every property readonly, recursively, through nested objects **and arrays**.
  Leave functions as they are.

## Part C: A typed event emitter

`createEmitter<Events>()` currently accepts any event name with any payload. Type `on` and `emit` so that:

- only keys of `Events` are allowed as event names
- the payload type follows from the event name
- `on` returns an unsubscribe function

Then implement it: several handlers per event, unsubscribing works, and emitting an event with no handlers does nothing.

## Part D: `as const` + `satisfies`

`LOCALES` is a config array. Make `LocaleCode` the union `'en-US' | 'de-DE' | 'ja-JP' | 'ar-SA'`, *derived from
the array*, not written out by hand. Keep the array checked against `LocaleConfig`, so a typo like `rtll: true` is an error.

## Be ready to answer out loud

- `type` vs `interface`: when does the difference actually matter?
- What does `satisfies` give you that a type annotation (`const x: T = ...`) doesn't?
- What happens to `DeepReadonly` on a `Date`, a `Map`, or a function? Is that what you want?
- `unknown` vs `any` vs `never`, one sentence each.
