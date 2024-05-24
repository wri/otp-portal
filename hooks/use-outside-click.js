import { useEffect, useCallback } from 'react';

export default function useOutsideClick(element, action) {
  if (typeof action !== 'function') throw new Error('useOutsideClick expects action to be function');

  const handleClickOutside = useCallback((event) => {
    if (!element.current) return;
    if (!element.current.contains(event.target)) action();
  }, [element, action]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchStart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handleClickOutside]);
}
