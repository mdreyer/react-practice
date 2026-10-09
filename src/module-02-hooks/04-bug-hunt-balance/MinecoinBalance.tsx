// 2.4 Bug Hunt (effects edition). This component has 6 bugs. The spec is in README.md in this folder.
import { useEffect, useState } from 'react';

export type MinecoinBalanceProps = {
  userId: string;
  fetchBalance: (userId: string) => Promise<number>;
  locale?: string;
  tickMs?: number;
};

export function MinecoinBalance({
  userId,
  fetchBalance,
  locale = 'en-US',
  tickMs = 1000,
}: MinecoinBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [formatted, setFormatted] = useState('');
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Load the balance
  useEffect(() => {
    fetchBalance(userId).then((value) => {
      setBalance(value);
      setSecondsAgo(0);
    });
  }, []);

  // Format it for display
  useEffect(() => {
    setFormatted(balance === null ? '' : new Intl.NumberFormat(locale).format(balance));
  }, [balance]);

  // Refresh when the player comes back to this tab
  useEffect(() => {
    const onFocus = () => {
      fetchBalance(userId).then((value) => {
        setBalance(value);
        setSecondsAgo(0);
      });
    };
    window.addEventListener('focus', onFocus);
  }, [userId, fetchBalance]);

  // "Updated Ns ago" ticker
  useEffect(() => {
    setInterval(() => {
      setSecondsAgo(secondsAgo + 1);
    }, tickMs);
  }, []);

  return (
    <section>
      <h2>Minecoin balance</h2>
      <p>{balance === null ? 'Loading balance…' : `Balance: ${formatted} Minecoins`}</p>
      <p>Updated {secondsAgo}s ago</p>
    </section>
  );
}
