// 4.3 Cart context. The spec is in README.md in this folder.
import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';

export const MAX_QUANTITY = 99;

export type Product = { sku: string; name: string; priceCents: number };
export type CartLine = Product & { quantity: number };

export type CartState = {
  lines: CartLine[];
  itemCount: number;
  totalCents: number;
};

export type CartActions = {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (sku: string) => void;
  setQuantity: (sku: string, quantity: number) => void;
  clear: () => void;
};

export type CartProviderProps = {
  children: ReactNode;
  initialLines?: CartLine[];
};

export function CartProvider({ children, initialLines = [] }: CartProviderProps) {
  // TODO
  return <>{children}</>;
}

export function useCart(): CartState {
  // TODO
  throw new Error('Not implemented');
}

export function useCartActions(): CartActions {
  // TODO
  throw new Error('Not implemented');
}
