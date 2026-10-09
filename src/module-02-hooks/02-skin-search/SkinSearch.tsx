// 2.2 Skin Search. The spec is in README.md in this folder.
import { useEffect, useState } from 'react';

export type Skin = {
  id: string;
  name: string;
  creator: string;
};

export type SkinSearchProps = {
  searchSkins: (query: string, signal: AbortSignal) => Promise<Skin[]>;
  debounceMs?: number;
};

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  // TODO: build it!
  return value;
}

export function SkinSearch({ searchSkins, debounceMs = 300 }: SkinSearchProps) {
  // TODO: build it!
  return <div>TODO: skin search</div>;
}
