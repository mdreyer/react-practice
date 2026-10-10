// 3.4 Generic component. The spec is in README.md in this folder.
import type { ReactNode } from 'react';

// TODO: make these props (and the component) generic over the item type.
export type SelectableListProps = {
  label: string;
  items: readonly unknown[];
  getKey: (item: unknown) => string;
  getLabel: (item: unknown) => string;
  renderItem?: (item: unknown) => ReactNode;
  selectedKey: string | null;
  onSelect: (item: unknown) => void;
  emptyMessage?: string;
};

export function SelectableList(props: SelectableListProps) {
  // TODO: build it!
  return <div>TODO: selectable list</div>;
}
