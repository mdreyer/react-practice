import { describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient } from './apiClient';

const BASE = 'https://api.minecraft.example';

/** A minimal stand-in for a fetch Response. */
function fakeResponse(status: number, body?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (body === undefined) throw new SyntaxError('Unexpected end of JSON input');
      return body;
    },
  } as unknown as Response;
}

function setup(response: Response | Error) {
  const fetchImpl = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  const client = createApiClient(fetchImpl as unknown as typeof fetch, BASE);
  return { fetchImpl, client };
}

const initOf = (fetchImpl: { mock: { calls: unknown[][] } }) => fetchImpl.mock.calls[0]![1] as RequestInit;
const urlOf = (fetchImpl: { mock: { calls: unknown[][] } }) => fetchImpl.mock.calls[0]![0] as string;

describe('3.3 createApiClient', () => {
  it('sends a GET to baseUrl + path with an Accept header and no body', async () => {
    const profile = { id: 'u1', gamertag: 'Alex', minecoins: 120 };
    const { fetchImpl, client } = setup(fakeResponse(200, profile));
    const result = await client.request('GET /api/profile');

    expect(result).toEqual(profile);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(urlOf(fetchImpl)).toBe(`${BASE}/api/profile`);
    const init = initOf(fetchImpl);
    expect(init.method).toBe('GET');
    expect(new Headers(init.headers).get('Accept')).toBe('application/json');
    expect(init.body).toBeUndefined();
  });

  it('sends JSON bodies with a Content-Type header', async () => {
    const confirmation = { orderId: 'o-1', totalCents: 1198 };
    const { fetchImpl, client } = setup(fakeResponse(201, confirmation));
    const result = await client.request('POST /api/orders', { bundleId: 'explorer', quantity: 2 });

    expect(result).toEqual(confirmation);
    const init = initOf(fetchImpl);
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual({ bundleId: 'explorer', quantity: 2 });
  });

  it('resolves 204 No Content to null', async () => {
    const { client } = setup(fakeResponse(204));
    await expect(client.request('DELETE /api/realms/invites', { inviteIds: ['i1'] })).resolves.toBeNull();
  });

  it('throws ApiError with status and problem details for a non-2xx response', async () => {
    const problem = { title: 'Insufficient Minecoins', status: 409, detail: 'Balance is 100.' };
    const { client } = setup(fakeResponse(409, problem));
    const error = await client.request('POST /api/orders', { bundleId: 'legend', quantity: 1 }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.problem).toEqual(problem);
    expect(error.message).toBe('Insufficient Minecoins');
  });

  it('uses a generic message when the error body is not JSON', async () => {
    const { client } = setup(fakeResponse(502));
    const error = await client.request('GET /api/bundles').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
    expect(error.problem).toBeUndefined();
    expect(error.message).toBe('Request failed with status 502');
  });

  it('passes network errors through unchanged', async () => {
    const networkError = new TypeError('Failed to fetch');
    const { client } = setup(networkError);
    await expect(client.request('GET /api/profile')).rejects.toBe(networkError);
  });
});
