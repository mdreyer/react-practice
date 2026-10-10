import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SelectableList } from './SelectableList';

type Bundle = { id: string; name: string; priceCents: number };
type Friend = { userId: string; gamertag: string; online: boolean };

const BUNDLES: Bundle[] = [
  { id: 'starter', name: 'Starter Stack', priceCents: 199 },
  { id: 'explorer', name: 'Explorer Pack', priceCents: 599 },
];

const FRIENDS: Friend[] = [
  { userId: 'u1', gamertag: 'blockhead', online: true },
  { userId: 'u2', gamertag: 'zuri_crafts', online: false },
];

describe('3.4 SelectableList', () => {
  it('renders a labelled list of buttons using getLabel by default', () => {
    render(
      <SelectableList
        label="Bundles"
        items={BUNDLES}
        getKey={(b) => b.id}
        getLabel={(b) => b.name}
        selectedKey={null}
        onSelect={() => {}}
      />,
    );
    const list = screen.getByRole('list', { name: 'Bundles' });
    const buttons = within(list).getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Starter Stack');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  });

  it('marks only the selected item as pressed', () => {
    render(
      <SelectableList
        label="Bundles"
        items={BUNDLES}
        getKey={(b) => b.id}
        getLabel={(b) => b.name}
        selectedKey="explorer"
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Explorer Pack' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Starter Stack' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelect with the original item object', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SelectableList
        label="Friends"
        items={FRIENDS}
        getKey={(f) => f.userId}
        getLabel={(f) => f.gamertag}
        selectedKey={null}
        onSelect={onSelect}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'zuri_crafts' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]![0]).toBe(FRIENDS[1]);
  });

  it('uses renderItem for custom content when provided', () => {
    render(
      <SelectableList
        label="Friends"
        items={FRIENDS}
        getKey={(f) => f.userId}
        getLabel={(f) => f.gamertag}
        renderItem={(f) => (
          <>
            <strong>{f.gamertag}</strong> <span>{f.online ? 'online' : 'offline'}</span>
          </>
        )}
        selectedKey="u1"
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'blockhead online' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'zuri_crafts offline' })).toBeInTheDocument();
  });

  it('shows the empty message when there are no items', () => {
    const { rerender } = render(
      <SelectableList
        label="Bundles"
        items={[] as Bundle[]}
        getKey={(b) => b.id}
        getLabel={(b) => b.name}
        selectedKey={null}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('No items.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    rerender(
      <SelectableList
        label="Bundles"
        items={[] as Bundle[]}
        getKey={(b) => b.id}
        getLabel={(b) => b.name}
        selectedKey={null}
        onSelect={() => {}}
        emptyMessage="No bundles available in your region."
      />,
    );
    expect(screen.getByText('No bundles available in your region.')).toBeInTheDocument();
  });
});
