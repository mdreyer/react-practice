// Compile-time tests for 3.1. Run with: npm run typecheck:m3
// Passing = zero errors. Don't edit this file.
import type { Equal, Expect } from '../type-test-utils';
import {
  createEmitter,
  type CheckoutEvents,
  type DeepReadonly,
  type KeysOfType,
  type LocaleCode,
  type LocaleConfig,
  type Optional,
  type ValueOf,
} from './puzzles';

type Profile = {
  id: string;
  gamertag: string;
  bio: string;
  avatarUrl: string;
  minecoins: number;
  marketingEmails: boolean;
};

// ─── Part B ──────────────────────────────────────────────────────────────────

type ProfileDraft = Optional<Profile, 'bio' | 'avatarUrl'>;
const draft: ProfileDraft = { id: '1', gamertag: 'Alex', minecoins: 0, marketingEmails: false };
// @ts-expect-error required keys stay required
const badDraft: ProfileDraft = { id: '1', minecoins: 0, marketingEmails: false };

type _valueOf = Expect<Equal<ValueOf<Profile>, string | number | boolean>>;
type _valueOf2 = Expect<Equal<ValueOf<{ a: 'x'; b: 1 }>, 'x' | 1>>;

type _keysOfType = Expect<Equal<KeysOfType<Profile, string>, 'id' | 'gamertag' | 'bio' | 'avatarUrl'>>;
type _keysOfType2 = Expect<Equal<KeysOfType<Profile, number | boolean>, 'minecoins' | 'marketingEmails'>>;

type Settings = {
  theme: { mode: 'dark' | 'light'; accent: string };
  favorites: { sku: string }[];
  onChange: (value: string) => void;
};
declare const settings: DeepReadonly<Settings>;
// @ts-expect-error top-level props are readonly
settings.theme = { mode: 'dark', accent: 'green' };
// @ts-expect-error nested props are readonly
settings.theme.mode = 'light';
// @ts-expect-error arrays become readonly (no push)
settings.favorites.push({ sku: 'x' });
// @ts-expect-error objects inside arrays are readonly too
settings.favorites[0]!.sku = 'y';
settings.onChange('functions still callable');

// ─── Part C ──────────────────────────────────────────────────────────────────

const emitter = createEmitter<CheckoutEvents>();
emitter.on('itemAdded', (payload) => {
  type _payload = Expect<Equal<typeof payload, { sku: string; quantity: number }>>;
});
emitter.emit('purchaseCompleted', { orderId: 'o-1' });
const off: () => void = emitter.on('checkoutStarted', () => {});
// @ts-expect-error unknown event name
emitter.on('itemRemoved', () => {});
// @ts-expect-error payload is missing `quantity`
emitter.emit('itemAdded', { sku: 'MC-1720' });
// @ts-expect-error wrong payload for this event
emitter.emit('checkoutStarted', { orderId: 'o-1' });
// @ts-expect-error payload is required
emitter.emit('purchaseCompleted');

// ─── Part D ──────────────────────────────────────────────────────────────────

type _localeCode = Expect<Equal<LocaleCode, 'en-US' | 'de-DE' | 'ja-JP' | 'ar-SA'>>;

// Demo: this is the kind of mistake `satisfies` catches (keep your LOCALES checked the same way):
const _typoCheck = [
  // @ts-expect-error `rtll` is not a LocaleConfig key
  { code: 'fr-FR', label: 'Français', rtll: false },
] satisfies readonly LocaleConfig[];

export {};
