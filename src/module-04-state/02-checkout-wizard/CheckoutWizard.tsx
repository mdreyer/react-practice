// 4.2 Checkout wizard. The spec is in README.md in this folder.
import { useEffect, useReducer, useRef } from 'react';
import {
  checkoutReducer,
  initialCheckoutState,
  isDetailsValid,
  type Details,
  type PaymentMethod,
} from '../01-checkout-reducer/checkoutReducer';

export type SubmitOrderRequest = {
  details: Details;
  payment: PaymentMethod;
  idempotencyKey: string;
};

export type CheckoutWizardProps = {
  submitOrder: (request: SubmitOrderRequest) => Promise<{ orderId: string }>;
  createIdempotencyKey?: () => string;
};

export const COUNTRY_NAMES = { US: 'United States', DE: 'Germany', JP: 'Japan', BR: 'Brazil' } as const;
export const PAYMENT_LABELS = { card: 'Card', paypal: 'PayPal', giftCard: 'Gift card' } as const;

export function CheckoutWizard({
  submitOrder,
  createIdempotencyKey = () => crypto.randomUUID(),
}: CheckoutWizardProps) {
  // TODO: build it!
  return <div>TODO: checkout wizard</div>;
}
