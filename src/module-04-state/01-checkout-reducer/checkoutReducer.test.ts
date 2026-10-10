import { describe, expect, it } from 'vitest';
import {
  checkoutReducer,
  initialCheckoutState,
  isDetailsValid,
  type CheckoutAction,
  type CheckoutState,
} from './checkoutReducer';

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

/** Run actions in order, freezing every intermediate state to catch mutation. */
function run(actions: CheckoutAction[], start: CheckoutState = initialCheckoutState): CheckoutState {
  return actions.reduce((s, a) => checkoutReducer(deepFreeze(s), a), deepFreeze(structuredClone(start)));
}

const VALID_DETAILS: CheckoutAction = { type: 'updateDetails', changes: { email: 'alex@example.com', country: 'US' } };
const TO_REVIEW: CheckoutAction[] = [VALID_DETAILS, { type: 'next' }, { type: 'selectPayment', method: 'card' }, { type: 'next' }];

describe('4.1 isDetailsValid', () => {
  it('accepts a plausible email with a country', () => {
    expect(isDetailsValid({ email: 'alex@example.com', country: 'DE' })).toBe(true);
  });
  it('rejects bad emails and a missing country', () => {
    expect(isDetailsValid({ email: 'alex@example', country: 'US' })).toBe(false);
    expect(isDetailsValid({ email: 'alex example@x.com', country: 'US' })).toBe(false);
    expect(isDetailsValid({ email: '', country: 'US' })).toBe(false);
    expect(isDetailsValid({ email: 'alex@example.com', country: '' })).toBe(false);
  });
});

describe('4.1 checkoutReducer: editing', () => {
  it('merges detail changes on the details step', () => {
    const s = run([
      { type: 'updateDetails', changes: { email: 'a@b.co' } },
      { type: 'updateDetails', changes: { country: 'JP' } },
    ]);
    expect(s).toEqual({ status: 'editing', step: 'details', details: { email: 'a@b.co', country: 'JP' }, payment: null });
  });

  it('only moves to payment when details are valid', () => {
    const blocked = deepFreeze(run([{ type: 'updateDetails', changes: { email: 'nope' } }]));
    expect(checkoutReducer(blocked, { type: 'next' })).toBe(blocked);

    const s = run([VALID_DETAILS, { type: 'next' }]);
    expect(s.status === 'editing' && s.step).toBe('payment');
  });

  it('only moves to review once a payment method is chosen', () => {
    const atPayment = deepFreeze(run([VALID_DETAILS, { type: 'next' }]));
    expect(checkoutReducer(atPayment, { type: 'next' })).toBe(atPayment);

    const s = run(TO_REVIEW);
    expect(s).toEqual({
      status: 'editing',
      step: 'review',
      details: { email: 'alex@example.com', country: 'US' },
      payment: 'card',
    });
  });

  it('goes back step by step, keeping entered data', () => {
    const s = run([...TO_REVIEW, { type: 'back' }]);
    expect(s.status === 'editing' && s.step).toBe('payment');
    const s2 = run([...TO_REVIEW, { type: 'back' }, { type: 'back' }]);
    expect(s2).toEqual({
      status: 'editing',
      step: 'details',
      details: { email: 'alex@example.com', country: 'US' },
      payment: 'card',
    });
  });

  it('ignores actions that belong to other steps (same object returned)', () => {
    const atDetails = deepFreeze(run([VALID_DETAILS]));
    expect(checkoutReducer(atDetails, { type: 'selectPayment', method: 'paypal' })).toBe(atDetails);
    expect(checkoutReducer(atDetails, { type: 'back' })).toBe(atDetails);
    expect(checkoutReducer(atDetails, { type: 'submit', idempotencyKey: 'k1' })).toBe(atDetails);

    const atPayment = deepFreeze(run([VALID_DETAILS, { type: 'next' }]));
    expect(checkoutReducer(atPayment, { type: 'updateDetails', changes: { email: 'x@y.zz' } })).toBe(atPayment);
  });
});

describe('4.1 checkoutReducer: submitting', () => {
  it('submits from review with the idempotency key', () => {
    const s = run([...TO_REVIEW, { type: 'submit', idempotencyKey: 'key-123' }]);
    expect(s).toEqual({
      status: 'submitting',
      details: { email: 'alex@example.com', country: 'US' },
      payment: 'card',
      idempotencyKey: 'key-123',
    });
  });

  it('ignores a second submit while submitting (no double charges)', () => {
    const submitting = deepFreeze(run([...TO_REVIEW, { type: 'submit', idempotencyKey: 'key-123' }]));
    expect(checkoutReducer(submitting, { type: 'submit', idempotencyKey: 'key-456' })).toBe(submitting);
    expect(checkoutReducer(submitting, { type: 'back' })).toBe(submitting);
  });

  it('succeeds', () => {
    const s = run([...TO_REVIEW, { type: 'submit', idempotencyKey: 'k' }, { type: 'submitSucceeded', orderId: 'o-42' }]);
    expect(s).toEqual({ status: 'succeeded', orderId: 'o-42' });
  });

  it('fails, keeping the key, then retries with the SAME key', () => {
    const failed = run([...TO_REVIEW, { type: 'submit', idempotencyKey: 'key-123' }, { type: 'submitFailed', error: 'Card declined' }]);
    expect(failed).toEqual({
      status: 'failed',
      details: { email: 'alex@example.com', country: 'US' },
      payment: 'card',
      idempotencyKey: 'key-123',
      error: 'Card declined',
    });
    const retried = run([{ type: 'retry' }], failed);
    expect(retried).toEqual({
      status: 'submitting',
      details: { email: 'alex@example.com', country: 'US' },
      payment: 'card',
      idempotencyKey: 'key-123',
    });
  });

  it('goes back to review from failed', () => {
    const failed = run([...TO_REVIEW, { type: 'submit', idempotencyKey: 'k' }, { type: 'submitFailed', error: 'x' }]);
    expect(run([{ type: 'back' }], failed)).toEqual({
      status: 'editing',
      step: 'review',
      details: { email: 'alex@example.com', country: 'US' },
      payment: 'card',
    });
  });

  it('ignores result actions when not submitting', () => {
    const atReview = deepFreeze(run(TO_REVIEW));
    expect(checkoutReducer(atReview, { type: 'submitSucceeded', orderId: 'o' })).toBe(atReview);
    expect(checkoutReducer(atReview, { type: 'submitFailed', error: 'e' })).toBe(atReview);
    expect(checkoutReducer(atReview, { type: 'retry' })).toBe(atReview);

    const done = deepFreeze(run([...TO_REVIEW, { type: 'submit', idempotencyKey: 'k' }, { type: 'submitSucceeded', orderId: 'o' }]));
    expect(checkoutReducer(done, { type: 'back' })).toBe(done);
    expect(checkoutReducer(done, { type: 'submitFailed', error: 'late' })).toBe(done);
  });
});
