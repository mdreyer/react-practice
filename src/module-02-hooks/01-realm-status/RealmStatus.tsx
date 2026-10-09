// 2.1 Realm Status Poller. The spec is in README.md in this folder.
import { useEffect, useState } from 'react';

export type RealmStatusResult = {
  online: boolean;
  playerCount: number;
};

export type RealmStatusProps = {
  realmId: string;
  fetchStatus: (realmId: string) => Promise<RealmStatusResult>;
  intervalMs?: number;
};

export function RealmStatus({ realmId, fetchStatus, intervalMs = 15000 }: RealmStatusProps) {
  // TODO: build it!
  return <div>TODO: realm status</div>;
}
