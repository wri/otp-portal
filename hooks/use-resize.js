import { useEffect } from 'react';

export default function useResize(callback) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', callback);
    callback();
    return () => window.removeEventListener('resize', callback);
  }, [callback]);
}
