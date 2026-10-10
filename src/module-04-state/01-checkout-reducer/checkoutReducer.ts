// 4.1 Checkout state machine. The spec is in README.md in this folder.

export type Country = 'US' | 'DE' | 'JP' | 'BR';
export type PaymentMethod = 'card' | 'paypal' | 'giftCard';

export type Details = {
  email: string;
  country: Country | '';
};

export type CheckoutState =
  | {
      status: 'editing';
      step: 'details' | 'payment' | 'review';
      details: Details;
      payment: PaymentMethod | null;
    }
  | { status: 'submitting'; details: Details; payment: PaymentMethod; idempotencyKey: string }
  | { status: 'failed'; details: Details; payment: PaymentMethod; idempotencyKey: string; error: string }
  | { status: 'succeeded'; orderId: string };

export type CheckoutAction =
  | { type: 'updateDetails'; changes: Partial<Details> }
  | { type: 'selectPayment'; method: PaymentMethod }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'submit'; idempotencyKey: string }
  | { type: 'submitSucceeded'; orderId: string }
  | { type: 'submitFailed'; error: string }
  | { type: 'retry' };

export const initialCheckoutState: CheckoutState = {
  status: 'editing',
  step: 'details',
  details: { email: '', country: '' },
  payment: null,
};

export function isDetailsValid(details: Details): boolean {
  // TODO
  return false;
}

export function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  // TODO
  return state;
}
