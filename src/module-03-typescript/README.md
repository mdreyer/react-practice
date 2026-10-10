# Module 3: TypeScript (about 2 hours)

| # | Problem | Level | Time | Checks |
|---|---|---|---|---|
| — | [Quick-fire Q&A](./QUICKFIRE.md) | — | 15 min | (out loud) |
| 3.1 | [Type Puzzles](./01-type-puzzles/README.md) | Intermediate → Advanced | 35 min | Vitest + `typecheck:m3` |
| 3.2 | [Parse Order DTOs from the C# API](./02-parse-order/README.md) | Intermediate+ | 35 min | Vitest |
| 3.3 | [Typed API Client](./03-api-client/README.md) | Advanced | 35 min | Vitest + `typecheck:m3` |
| 3.4 | [Generic React Component](./04-generic-list/README.md) | Intermediate | 20 min | Vitest + your editor |

```bash
npx vitest src/module-03-typescript    # runtime tests
npm run typecheck:m3                   # compile-time tests (the *.types.ts files)
```

**How the compile-time tests work:** `*.types.ts` files contain lines such as `type _ = Expect<Equal<A, B>>` and
`// @ts-expect-error`. `npm run typecheck:m3` runs the TypeScript compiler on just those files (and whatever they
import). **No output means everything passed.** Each error points at a line in a `*.types.ts` file, telling you
which expectation your types don't meet yet.

Vitest **does not type-check**: it strips the types and runs the JavaScript. That's why passing Vitest tests alone
don't prove your types are right.
