import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MarketplaceFilters } from './MarketplaceFilters';
import { useQueryParam } from './useQueryParam';

function goTo(url: string) {
  window.history.replaceState(null, '', url);
}

/** Simulate the user pressing Back/Forward to a given URL. */
function popTo(url: string) {
  act(() => {
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

function QueryEcho({ param }: { param: string }) {
  const [value] = useQueryParam(param, '(none)');
  return <output aria-label={`echo ${param}`}>{value}</output>;
}

const summary = () => screen.getByText(/^Showing /);

beforeEach(() => goTo('/marketplace'));

describe('4.4 MarketplaceFilters + useQueryParam', () => {
  it('uses defaults when the URL has no params', () => {
    render(<MarketplaceFilters />);
    expect(summary()).toHaveTextContent('Showing all skins sorted by Most popular, page 1');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it('reads initial state from the URL (shared links work)', () => {
    goTo('/marketplace?q=creeper&sort=newest&page=2');
    render(<MarketplaceFilters />);
    expect(summary()).toHaveTextContent('Showing "creeper" sorted by Newest, page 2');
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('creeper');
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue('newest');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
  });

  it('typing updates ?q= with replaceState (no history entry per keystroke) and keeps other params', async () => {
    goTo('/marketplace?ref=newsletter');
    const user = userEvent.setup();
    render(<MarketplaceFilters />);
    const lengthBefore = window.history.length;

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'ender');
    const params = new URLSearchParams(window.location.search);
    expect(params.get('q')).toBe('ender');
    expect(params.get('ref')).toBe('newsletter');
    expect(window.location.pathname).toBe('/marketplace');
    expect(window.history.length).toBe(lengthBefore);
    expect(summary()).toHaveTextContent('Showing "ender" sorted by Most popular, page 1');

    await user.clear(screen.getByRole('searchbox', { name: 'Search' }));
    expect(new URLSearchParams(window.location.search).has('q')).toBe(false);
  });

  it('changing sort pushes a history entry, and the default removes the param', async () => {
    const user = userEvent.setup();
    render(<MarketplaceFilters />);
    const lengthBefore = window.history.length;

    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'price-asc');
    expect(window.location.search).toBe('?sort=price-asc');
    expect(window.history.length).toBe(lengthBefore + 1);
    expect(summary()).toHaveTextContent('sorted by Price: low to high');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'popular');
    expect(window.location.search).toBe('');
  });

  it('pages forward and back through ?page=', async () => {
    const user = userEvent.setup();
    render(<MarketplaceFilters />);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(new URLSearchParams(window.location.search).get('page')).toBe('3');
    expect(summary()).toHaveTextContent('page 3');
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(summary()).toHaveTextContent('page 2');
  });

  it('responds to the Back/Forward buttons (popstate)', () => {
    render(<MarketplaceFilters />);
    popTo('/marketplace?q=axolotl&page=4');
    expect(summary()).toHaveTextContent('Showing "axolotl" sorted by Most popular, page 4');
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('axolotl');
  });

  it('keeps every hook instance in sync, including ones watching other keys', async () => {
    const user = userEvent.setup();
    render(
      <>
        <MarketplaceFilters />
        <QueryEcho param="q" />
        <QueryEcho param="sort" />
      </>,
    );
    expect(screen.getByRole('status', { name: 'echo q' })).toHaveTextContent('(none)');
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'pig');
    expect(screen.getByRole('status', { name: 'echo q' })).toHaveTextContent('pig');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'newest');
    expect(screen.getByRole('status', { name: 'echo sort' })).toHaveTextContent('newest');
  });

  it('removes its popstate listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<QueryEcho param="q" />);
    unmount();
    expect(removeSpy.mock.calls.map((c) => c[0])).toContain('popstate');
    removeSpy.mockRestore();
  });
});
