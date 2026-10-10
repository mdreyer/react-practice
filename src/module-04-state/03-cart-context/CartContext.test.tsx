import { Component, type ReactNode } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CartProvider, useCart, useCartActions, type CartActions, type Product } from './CartContext';

const COINS: Product = { sku: 'MC-1720', name: '1,720 Minecoins', priceCents: 999 };
const SKINS: Product = { sku: 'SP-01', name: 'Creeper Skin Pack', priceCents: 299 };

const formatUSD = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function CartView() {
  const { lines, itemCount, totalCents } = useCart();
  return (
    <section>
      <ul aria-label="Cart">
        {lines.map((l) => (
          <li key={l.sku}>
            {l.name} × {l.quantity}
          </li>
        ))}
      </ul>
      <p>Items: {itemCount}</p>
      <p>Total: {formatUSD(totalCents)}</p>
    </section>
  );
}

/** Exposes the actions to the test, and counts its own renders. */
function ActionsProbe({ onRender }: { onRender: (actions: CartActions) => void }) {
  const actions = useCartActions();
  onRender(actions);
  return (
    <>
      <button type="button" onClick={() => actions.addItem(COINS)}>Add coins</button>
      <button type="button" onClick={() => actions.addItem(SKINS, 2)}>Add skins</button>
    </>
  );
}

class Boundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }
  render() {
    return this.state.message ? <p role="alert">{this.state.message}</p> : this.props.children;
  }
}

function setup(initialLines?: Parameters<typeof CartProvider>[0]['initialLines']) {
  const renders: CartActions[] = [];
  render(
    <CartProvider initialLines={initialLines}>
      <ActionsProbe onRender={(a) => renders.push(a)} />
      <CartView />
    </CartProvider>,
  );
  const actions = () => renders[renders.length - 1]!;
  return { user: userEvent.setup(), renders, actions };
}

const lines = () => screen.queryAllByRole('listitem').map((li) => li.textContent);

describe('4.3 CartContext', () => {
  it('adds items and merges duplicate SKUs, keeping insertion order', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Add coins' }));
    await user.click(screen.getByRole('button', { name: 'Add skins' }));
    await user.click(screen.getByRole('button', { name: 'Add coins' }));
    expect(lines()).toEqual(['1,720 Minecoins × 2', 'Creeper Skin Pack × 2']);
    expect(screen.getByText('Items: 4')).toBeInTheDocument();
    expect(screen.getByText('Total: $25.96')).toBeInTheDocument();
  });

  it('supports initialLines', () => {
    setup([{ ...SKINS, quantity: 3 }]);
    expect(lines()).toEqual(['Creeper Skin Pack × 3']);
    expect(screen.getByText('Total: $8.97')).toBeInTheDocument();
  });

  it('setQuantity updates, clamps to 99, and removes at 0', () => {
    const { actions } = setup([{ ...COINS, quantity: 1 }, { ...SKINS, quantity: 1 }]);
    act(() => actions().setQuantity('MC-1720', 5));
    expect(lines()).toEqual(['1,720 Minecoins × 5', 'Creeper Skin Pack × 1']);
    act(() => actions().setQuantity('MC-1720', 500));
    expect(lines()[0]).toBe('1,720 Minecoins × 99');
    act(() => actions().setQuantity('SP-01', 0));
    expect(lines()).toEqual(['1,720 Minecoins × 99']);
  });

  it('addItem never exceeds 99 either', () => {
    const { actions } = setup([{ ...COINS, quantity: 98 }]);
    act(() => actions().addItem(COINS, 5));
    expect(lines()).toEqual(['1,720 Minecoins × 99']);
  });

  it('removeItem and clear', () => {
    const { actions } = setup([{ ...COINS, quantity: 1 }, { ...SKINS, quantity: 1 }]);
    act(() => actions().removeItem('MC-1720'));
    expect(lines()).toEqual(['Creeper Skin Pack × 1']);
    act(() => actions().clear());
    expect(lines()).toEqual([]);
    expect(screen.getByText('Items: 0')).toBeInTheDocument();
  });

  it('does not re-render action-only components when the cart changes', async () => {
    const { user, renders } = setup();
    const before = renders.length;
    await user.click(screen.getByRole('button', { name: 'Add coins' }));
    await user.click(screen.getByRole('button', { name: 'Add skins' }));
    expect(screen.getByText('Items: 3')).toBeInTheDocument();
    expect(renders.length).toBe(before);
  });

  it('keeps the actions object stable across cart changes', () => {
    const seen: CartActions[] = [];
    function Both() {
      useCart(); // re-renders on every change
      seen.push(useCartActions());
      return null;
    }
    render(
      <CartProvider>
        <Both />
        <ActionsProbe onRender={() => {}} />
      </CartProvider>,
    );
    act(() => seen[0]!.addItem(COINS));
    act(() => seen[0]!.addItem(SKINS));
    expect(seen.length).toBeGreaterThanOrEqual(3);
    expect(new Set(seen).size).toBe(1);
  });

  it('throws a helpful error when used outside the provider', () => {
    function Orphan() {
      useCart();
      return null;
    }
    function OrphanActions() {
      useCartActions();
      return null;
    }
    render(
      <>
        <Boundary><Orphan /></Boundary>
        <Boundary><OrphanActions /></Boundary>
      </>,
    );
    const alerts = screen.getAllByRole('alert').map((a) => a.textContent);
    expect(alerts).toEqual([
      'useCart must be used within a CartProvider',
      'useCartActions must be used within a CartProvider',
    ]);
  });
});
