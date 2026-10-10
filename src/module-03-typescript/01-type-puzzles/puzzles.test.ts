import { describe, expect, it, vi } from 'vitest';
import { createEmitter, describeEntitlement, LOCALES, type CheckoutEvents } from './puzzles';

describe('3.1 describeEntitlement', () => {
  it('describes each kind of entitlement', () => {
    expect(describeEntitlement({ kind: 'skinPack', id: 'a', skinCount: 12 })).toBe('Skin pack (12 skins)');
    expect(describeEntitlement({ kind: 'skinPack', id: 'b', skinCount: 1 })).toBe('Skin pack (1 skin)');
    expect(describeEntitlement({ kind: 'world', id: 'c', sizeMb: 350 })).toBe('World (350 MB)');
    expect(describeEntitlement({ kind: 'minecoins', id: 'd', amount: 1720 })).toBe('1,720 Minecoins');
    expect(
      describeEntitlement({ kind: 'realmsPlus', id: 'e', expiresAt: new Date('2026-12-31T23:00:00Z') }),
    ).toBe('Realms Plus (expires 2026-12-31)');
  });

  it('throws for an unknown kind that slips past the types at runtime', () => {
    const bad = { kind: 'cape', id: 'x' } as unknown as Parameters<typeof describeEntitlement>[0];
    expect(() => describeEntitlement(bad)).toThrow();
  });
});

describe('3.1 createEmitter', () => {
  it('calls every handler for an event with its payload', () => {
    const emitter = createEmitter<CheckoutEvents>();
    const a = vi.fn();
    const b = vi.fn();
    emitter.on('itemAdded', a);
    emitter.on('itemAdded', b);
    emitter.emit('itemAdded', { sku: 'MC-1720', quantity: 2 });
    expect(a).toHaveBeenCalledWith({ sku: 'MC-1720', quantity: 2 });
    expect(b).toHaveBeenCalledWith({ sku: 'MC-1720', quantity: 2 });
  });

  it('only calls handlers for the emitted event', () => {
    const emitter = createEmitter<CheckoutEvents>();
    const started = vi.fn();
    emitter.on('checkoutStarted', started);
    emitter.emit('purchaseCompleted', { orderId: 'o-1' });
    expect(started).not.toHaveBeenCalled();
  });

  it('returns an unsubscribe function that removes only that handler', () => {
    const emitter = createEmitter<CheckoutEvents>();
    const a = vi.fn();
    const b = vi.fn();
    const offA = emitter.on('purchaseCompleted', a);
    emitter.on('purchaseCompleted', b);
    offA();
    emitter.emit('purchaseCompleted', { orderId: 'o-2' });
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('does nothing when an event has no handlers', () => {
    const emitter = createEmitter<CheckoutEvents>();
    expect(() => emitter.emit('checkoutStarted', { cartTotalCents: 999 })).not.toThrow();
  });
});

describe('3.1 LOCALES', () => {
  it('still has the same runtime data', () => {
    expect(LOCALES.map((l) => l.code)).toEqual(['en-US', 'de-DE', 'ja-JP', 'ar-SA']);
    expect(LOCALES.find((l) => l.code === 'ar-SA')?.rtl).toBe(true);
  });
});
