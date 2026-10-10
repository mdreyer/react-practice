// Tiny helpers for compile-time tests. You don't need to edit this file.
// `Expect<Equal<A, B>>` is a compile error unless A and B are exactly the same type.

export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

export type Expect<T extends true> = T;
