// 3.1 Type Puzzles. The spec is in README.md in this folder.

// ─── Part A: discriminated union ────────────────────────────────────────────

export type Entitlement =
  | { kind: 'skinPack'; id: string; skinCount: number }
  | { kind: 'world'; id: string; sizeMb: number }
  | { kind: 'minecoins'; id: string; amount: number }
  | { kind: 'realmsPlus'; id: string; expiresAt: Date };

export function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

export function describeEntitlement(e: Entitlement): string {
  // TODO
  return '';
}

// ─── Part B: utility types ───────────────────────────────────────────────────

export type Optional<T, K extends keyof T> = T; // TODO

export type ValueOf<T> = unknown; // TODO

export type KeysOfType<T, V> = keyof T; // TODO

export type DeepReadonly<T> = T; // TODO

// ─── Part C: typed event emitter ─────────────────────────────────────────────

export type CheckoutEvents = {
  itemAdded: { sku: string; quantity: number };
  checkoutStarted: { cartTotalCents: number };
  purchaseCompleted: { orderId: string };
};

// TODO: make this generic over Events, and type `on` / `emit` properly.
export function createEmitter<Events extends Record<string, unknown>>() {
  return {
    on(type: string, handler: (payload: any) => void): () => void {
      // TODO
      return () => {};
    },
    emit(type: string, payload?: unknown): void {
      // TODO
    },
  };
}

// ─── Part D: as const + satisfies ────────────────────────────────────────────

export type LocaleConfig = {
  code: string;
  label: string;
  rtl: boolean;
};

// TODO: keep this checked against LocaleConfig, but let TypeScript remember the exact codes.
export const LOCALES: LocaleConfig[] = [
  { code: 'en-US', label: 'English (United States)', rtl: false },
  { code: 'de-DE', label: 'Deutsch', rtl: false },
  { code: 'ja-JP', label: '日本語', rtl: false },
  { code: 'ar-SA', label: 'العربية', rtl: true },
];

export type LocaleCode = (typeof LOCALES)[number]['code'];
