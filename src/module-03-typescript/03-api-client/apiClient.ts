// 3.3 Typed API client. The spec is in README.md in this folder.

export type Profile = { id: string; gamertag: string; minecoins: number };
export type Bundle = { id: string; name: string; priceCents: number };
export type CreateOrderRequest = { bundleId: string; quantity: number };
export type OrderConfirmation = { orderId: string; totalCents: number };
export type SettingsUpdate = { language?: string; marketingEmails?: boolean };

export type ApiRoutes = {
  'GET /api/profile': { response: Profile };
  'GET /api/bundles': { response: Bundle[] };
  'POST /api/orders': { body: CreateOrderRequest; response: OrderConfirmation };
  'PUT /api/profile/settings': { body: SettingsUpdate; response: Profile };
  'DELETE /api/realms/invites': { body: { inviteIds: string[] }; response: null };
};

export type RouteKey = keyof ApiRoutes;

/** RFC 9457 problem details, as returned by ASP.NET Core. */
export type ProblemDetails = { title?: string; status?: number; detail?: string; [key: string]: unknown };

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly problem?: ProblemDetails,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ResponseOf<K extends RouteKey> = unknown; // TODO

export type BodyArgs<K extends RouteKey> = unknown[]; // TODO

export function createApiClient(fetchImpl: typeof fetch, baseUrl: string) {
  return {
    // TODO: make this generic and type-safe (see README).
    async request(route: string, body?: unknown): Promise<any> {
      // TODO
    },
  };
}
