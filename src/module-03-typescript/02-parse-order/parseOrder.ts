// 3.2 Parse, don't validate. The spec is in README.md in this folder.

export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'refunded';

export type OrderLine = {
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
};

export type Order = {
  id: string;
  status: OrderStatus;
  createdAt: Date;
  totalCents: number;
  currency: string;
  lines: OrderLine[];
  promoCode?: string;
};

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseOrder(json: unknown): ParseResult<Order> {
  // TODO: replace the unsafe cast below with real parsing.
  return { ok: true, value: json as Order };
}
