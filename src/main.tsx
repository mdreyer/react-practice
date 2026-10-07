// Playground: run `npm run dev` to try your components by hand in the browser preview.
// You don't need to edit this file. The tests are the real feedback loop.
import { StrictMode, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BundlePicker } from './module-01-warmup/01-bundle-picker/BundlePicker';
import { BUNDLES } from './module-01-warmup/01-bundle-picker/bundles.fixture';
import { ProfileSettingsForm } from './module-01-warmup/02-profile-settings/ProfileSettingsForm';
import { RealmInvites } from './module-01-warmup/03-realm-invites/RealmInvites';
import { FRIENDS } from './module-01-warmup/03-realm-invites/friends.fixture';
import { ServerList } from './module-01-warmup/04-bug-hunt-server-list/ServerList';

const log = (label: string) => (value: unknown) => console.log(label, value);

const PROBLEMS: Record<string, () => ReactNode> = {
  '1.1 Bundle picker': () => <BundlePicker bundles={BUNDLES} onPurchase={log('purchase')} />,
  '1.2 Profile settings': () => (
    <ProfileSettingsForm
      initialValues={{ gamertag: 'Alex_Builds', language: 'en-US', marketingEmails: false }}
      onSave={log('save')}
    />
  ),
  '1.3 Realm invites': () => <RealmInvites friends={FRIENDS} onSendInvites={log('send invites')} />,
  '1.4 Bug hunt': () => (
    <ServerList
      initialServers={[
        { id: 1, name: 'Skyblock Isles', address: 'sky.example.net' },
        { id: 2, name: 'Creative Plots', address: 'build.example.org' },
        { id: 3, name: 'Parkour Peak', address: 'parkour.example.com' },
      ]}
    />
  ),
};

function Playground() {
  const names = Object.keys(PROBLEMS);
  const [current, setCurrent] = useState(names[0]!);
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Mojang prep playground</h1>
      <nav aria-label="Problems" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {names.map((name) => (
          <button key={name} type="button" aria-pressed={name === current} onClick={() => setCurrent(name)}>
            {name}
          </button>
        ))}
      </nav>
      {/* key forces a fresh mount when switching problems */}
      <div key={current}>{PROBLEMS[current]!()}</div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Playground />
  </StrictMode>,
);
