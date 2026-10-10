import { describe, expect, it } from 'vitest';
import { parseOrder, type Order } from './parseOrder';

function validDto(): Record<string, unknown> {
  return {
    orderId: '9007199254740993',
    status: 1,
    createdAt: '2026-10-09T17:30:00Z',
    total: 19.98,
    currency: 'USD',
    lines: [{ sku: 'MC-1720', name: '1,720 Minecoins', quantity: 2, unitPrice: 9.99 }],
    promoCode: null,
    serverRegion: 'westus2', // unknown extra field: ignore it
  };
}

function expectError(json: unknown, ...fragments: string[]) {
  const result = parseOrder(json);
  expect(result.ok).toBe(false);
  if (!result.ok) {
    for (const fragment of fragments) expect(result.error).toContain(fragment);
  }
}

describe('3.2 parseOrder: happy path', () => {
  it('parses a valid DTO into a domain Order', () => {
    const result = parseOrder(validDto());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const order: Order = result.value;
    expect(order.id).toBe('9007199254740993');
    expect(order.status).toBe('paid');
    expect(order.createdAt).toBeInstanceOf(Date);
    expect(order.createdAt.toISOString()).toBe('2026-10-09T17:30:00.000Z');
    expect(order.totalCents).toBe(1998);
    expect(order.currency).toBe('USD');
    expect(order.lines).toEqual([
      { sku: 'MC-1720', name: '1,720 Minecoins', quantity: 2, unitPriceCents: 999 },
    ]);
    expect('promoCode' in order).toBe(false);
    expect('serverRegion' in order).toBe(false);
  });

  it('maps every status number', () => {
    const statuses = [0, 1, 2, 3].map((status) => {
      const result = parseOrder({ ...validDto(), status });
      return result.ok ? result.value.status : 'ERROR';
    });
    expect(statuses).toEqual(['pending', 'paid', 'fulfilled', 'refunded']);
  });

  it('keeps a promo code when present, and accepts a missing one', () => {
    const withPromo = parseOrder({ ...validDto(), promoCode: 'CREEPER10' });
    expect(withPromo.ok && withPromo.value.promoCode).toBe('CREEPER10');

    const dto = validDto();
    delete dto.promoCode;
    const missing = parseOrder(dto);
    expect(missing.ok).toBe(true);
    expect(missing.ok && 'promoCode' in missing.value).toBe(false);
  });

  it('survives floating-point dollars (0.1 × 3 = 0.30000000000000004)', () => {
    const result = parseOrder({
      ...validDto(),
      total: 0.3,
      lines: [{ sku: 'X', name: 'Penny candy', quantity: 3, unitPrice: 0.1 }],
    });
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.totalCents).toBe(30);
  });
});

describe('3.2 parseOrder: errors', () => {
  it('rejects non-objects', () => {
    expectError(null);
    expectError('order');
    expectError([validDto()]);
  });

  it('rejects a numeric or malformed orderId', () => {
    expectError({ ...validDto(), orderId: 9007199254740993 }, 'orderId');
    expectError({ ...validDto(), orderId: '' }, 'orderId');
    expectError({ ...validDto(), orderId: 'abc' }, 'orderId');
  });

  it('rejects unknown status values and string statuses', () => {
    expectError({ ...validDto(), status: 7 }, 'status');
    expectError({ ...validDto(), status: 1.5 }, 'status');
    expectError({ ...validDto(), status: 'Paid' }, 'status');
  });

  it('rejects invalid dates', () => {
    expectError({ ...validDto(), createdAt: 'yesterday' }, 'createdAt');
    expectError({ ...validDto(), createdAt: 1760031000 }, 'createdAt');
  });

  it('rejects bad totals and currencies', () => {
    expectError({ ...validDto(), total: '19.98' }, 'total');
    expectError({ ...validDto(), total: -1 }, 'total');
    expectError({ ...validDto(), total: Number.NaN }, 'total');
    expectError({ ...validDto(), currency: 'usd' }, 'currency');
  });

  it('rejects missing or empty lines', () => {
    expectError({ ...validDto(), lines: [] }, 'lines');
    expectError({ ...validDto(), lines: 'MC-1720' }, 'lines');
  });

  it('reports the path of a bad line field', () => {
    const lines = [
      { sku: 'MC-320', name: '320 Minecoins', quantity: 1, unitPrice: 1.99 },
      { sku: 'MC-1720', name: '1,720 Minecoins', quantity: 0, unitPrice: 9.99 },
    ];
    expectError({ ...validDto(), total: 1.99, lines }, 'lines[1].quantity');
    expectError(
      { ...validDto(), lines: [{ sku: '', name: 'x', quantity: 1, unitPrice: 19.98 }] },
      'lines[0].sku',
    );
    expectError(
      { ...validDto(), lines: [{ sku: 'A', name: 'x', quantity: 2.5, unitPrice: 1 }] },
      'lines[0].quantity',
    );
  });

  it('rejects a non-string promo code', () => {
    expectError({ ...validDto(), promoCode: 10 }, 'promoCode');
  });

  it('enforces that the total matches the line items', () => {
    expectError({ ...validDto(), total: 20.0 }, 'does not match');
  });

  it('returns the FIRST problem when there are several', () => {
    expectError({ ...validDto(), status: 9, currency: 'usd' }, 'status');
  });
});
