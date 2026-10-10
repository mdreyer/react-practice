import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CheckoutWizard, type SubmitOrderRequest } from './CheckoutWizard';
import { deferred } from '../../module-02-hooks/test-utils';

function setup(submitOrder = vi.fn((_req: SubmitOrderRequest) => Promise.resolve({ orderId: 'o-42' }))) {
  const user = userEvent.setup();
  const createIdempotencyKey = vi.fn(() => 'key-1');
  render(<CheckoutWizard submitOrder={submitOrder} createIdempotencyKey={createIdempotencyKey} />);
  return { user, submitOrder, createIdempotencyKey };
}

const currentStep = () =>
  within(screen.getByRole('list', { name: 'Checkout progress' }))
    .getAllByRole('listitem')
    .find((li) => li.getAttribute('aria-current') === 'step');

async function fillDetails(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: 'Email' }), 'alex@example.com');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Country' }), 'US');
}

async function goToReview(user: ReturnType<typeof userEvent.setup>) {
  await fillDetails(user);
  await user.click(screen.getByRole('button', { name: 'Continue to payment' }));
  await user.click(screen.getByRole('radio', { name: 'Card' }));
  await user.click(screen.getByRole('button', { name: 'Continue to review' }));
}

describe('4.2 CheckoutWizard', () => {
  it('starts on the details step without stealing focus', () => {
    setup();
    expect(screen.getByRole('heading', { level: 2, name: 'Your details' })).toBeInTheDocument();
    expect(currentStep()).toHaveTextContent('Details');
    expect(screen.getByRole('button', { name: 'Continue to payment' })).toBeDisabled();
    expect(screen.getByRole('heading', { name: 'Your details' })).not.toHaveFocus();
  });

  it('enables Continue once details are valid, then moves to payment and focuses its heading', async () => {
    const { user } = setup();
    await fillDetails(user);
    const next = screen.getByRole('button', { name: 'Continue to payment' });
    expect(next).toBeEnabled();
    await user.click(next);

    const heading = screen.getByRole('heading', { level: 2, name: 'Payment method' });
    expect(heading).toHaveFocus();
    expect(currentStep()).toHaveTextContent('Payment');
    expect(screen.getByRole('group', { name: 'Choose a payment method' })).toBeInTheDocument();
  });

  it('requires a payment method, and Back keeps the entered details', async () => {
    const { user } = setup();
    await fillDetails(user);
    await user.click(screen.getByRole('button', { name: 'Continue to payment' }));
    expect(screen.getByRole('button', { name: 'Continue to review' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('heading', { name: 'Your details' })).toHaveFocus();
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('alex@example.com');
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveValue('US');
  });

  it('shows a readable summary on the review step', async () => {
    const { user } = setup();
    await goToReview(user);
    expect(screen.getByRole('heading', { name: 'Review your order' })).toHaveFocus();
    expect(currentStep()).toHaveTextContent('Review');
    expect(screen.getByText('alex@example.com')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
  });

  it('places the order once, shows progress, then confirms', async () => {
    const pending = deferred<{ orderId: string }>();
    const submitOrder = vi.fn((_req: SubmitOrderRequest) => pending.promise);
    const { user, createIdempotencyKey } = setup(submitOrder);
    await goToReview(user);

    await user.click(screen.getByRole('button', { name: 'Place order' }));
    const placing = screen.getByRole('button', { name: 'Placing order…' });
    expect(placing).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    await user.click(placing); // a second click must not submit again

    expect(submitOrder).toHaveBeenCalledTimes(1);
    expect(createIdempotencyKey).toHaveBeenCalledTimes(1);
    expect(submitOrder).toHaveBeenCalledWith({
      details: { email: 'alex@example.com', country: 'US' },
      payment: 'card',
      idempotencyKey: 'key-1',
    });

    pending.resolve({ orderId: 'o-42' });
    const thanks = await screen.findByRole('heading', { name: 'Thank you!' });
    expect(screen.getByText('Order o-42 confirmed.')).toBeInTheDocument();
    await waitFor(() => expect(thanks).toHaveFocus());
  });

  it('shows the error and retries with the SAME idempotency key', async () => {
    const submitOrder = vi
      .fn()
      .mockRejectedValueOnce(new Error('Card declined'))
      .mockResolvedValue({ orderId: 'o-43' });
    const { user, createIdempotencyKey } = setup(submitOrder);
    await goToReview(user);
    await user.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Payment failed: Card declined');
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Order o-43 confirmed.')).toBeInTheDocument();
    expect(submitOrder).toHaveBeenCalledTimes(2);
    expect(submitOrder.mock.calls[1]![0].idempotencyKey).toBe('key-1');
    expect(createIdempotencyKey).toHaveBeenCalledTimes(1);
  });

  it('can go back to review after a failure', async () => {
    const submitOrder = vi.fn().mockRejectedValue('network down');
    const { user } = setup(submitOrder);
    await goToReview(user);
    await user.click(screen.getByRole('button', { name: 'Place order' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Payment failed: Something went wrong');

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Place order' })).toBeEnabled();
  });
});
