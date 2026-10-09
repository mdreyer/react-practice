// 2.3 Offline-aware purchase button. The spec is in README.md in this folder.
import { useSyncExternalStore } from 'react';

export function useOnlineStatus(): boolean {
  // TODO: build it with useSyncExternalStore!
  return true;
}

export type PurchaseButtonProps = {
  onPurchase: () => void;
};

export function PurchaseButton({ onPurchase }: PurchaseButtonProps) {
  // TODO: build it!
  return <div>TODO: purchase button</div>;
}
