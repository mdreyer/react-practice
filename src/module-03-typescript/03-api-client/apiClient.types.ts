// Compile-time tests for 3.3. Run with: npm run typecheck:m3. Don't edit this file.
import type { Equal, Expect } from '../type-test-utils';
import {
  createApiClient,
  type BodyArgs,
  type Bundle,
  type OrderConfirmation,
  type Profile,
  type ResponseOf,
} from './apiClient';

type _r1 = Expect<Equal<ResponseOf<'GET /api/profile'>, Profile>>;
type _r2 = Expect<Equal<ResponseOf<'GET /api/bundles'>, Bundle[]>>;
type _r3 = Expect<Equal<ResponseOf<'DELETE /api/realms/invites'>, null>>;

type _b1 = Expect<Equal<BodyArgs<'GET /api/profile'>, []>>;
type _b2 = Expect<Equal<BodyArgs<'POST /api/orders'>, [body: { bundleId: string; quantity: number }]>>;

declare const client: ReturnType<typeof createApiClient>;

async function usage() {
  const profile = await client.request('GET /api/profile');
  type _p = Expect<Equal<typeof profile, Profile>>;

  const order = await client.request('POST /api/orders', { bundleId: 'explorer', quantity: 2 });
  type _o = Expect<Equal<typeof order, OrderConfirmation>>;

  await client.request('PUT /api/profile/settings', { marketingEmails: true });

  // @ts-expect-error GET routes take no body
  await client.request('GET /api/profile', {});
  // @ts-expect-error POST /api/orders requires a body
  await client.request('POST /api/orders');
  // @ts-expect-error body is missing `quantity`
  await client.request('POST /api/orders', { bundleId: 'explorer' });
  // @ts-expect-error unknown route
  await client.request('GET /api/nope');
}

export { usage };
