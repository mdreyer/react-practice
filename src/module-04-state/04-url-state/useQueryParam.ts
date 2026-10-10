// 4.4 useQueryParam. The spec is in README.md in this folder.
import { useCallback, useSyncExternalStore } from 'react';

export type SetQueryParam = (value: string, options?: { replace?: boolean }) => void;

export function useQueryParam(key: string, defaultValue = ''): readonly [string, SetQueryParam] {
  // TODO: build it with useSyncExternalStore!
  const setValue: SetQueryParam = () => {};
  return [defaultValue, setValue] as const;
}
