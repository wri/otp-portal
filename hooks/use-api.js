import { useEffect, useState } from 'react';

/**
 * Runs `fetcher` whenever `key` changes; a null key skips it. Keeps the previous data while the
 * next request runs and drops responses for a key that is no longer current.
 * `key` must capture everything the fetcher depends on.
 */
export default function useApi(key, fetcher) {
  const [result, setResult] = useState({ key: undefined, data: undefined, error: false });

  useEffect(() => {
    if (key === null) return undefined;

    let current = true;
    fetcher().then(
      (data) => {
        if (current) setResult({ key, data, error: false });
      },
      (error) => {
        console.error(error);
        if (current) setResult((prev) => ({ ...prev, key, error: true }));
      }
    );

    return () => { current = false; };
  }, [key]);

  return { data: result.data, error: result.error, loading: key !== null && result.key !== key };
}
