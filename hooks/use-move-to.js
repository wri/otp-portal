import { useEffect, useRef, useCallback } from 'react';

export default function useMoveTo(section) {
  const moveToRef = useRef(null);

  const triggerScrollTo = useCallback((id) => {
    const target = document.querySelector(id);
    if (moveToRef.current && target) {
      moveToRef.current.move(target);
    }
  }, []);

  useEffect(() => {
    const MoveTo = require('moveto'); //eslint-disable-line
    moveToRef.current = new MoveTo({
      tolerance: 50,
      duration: 500,
      easing: 'easeOutQuart'
    });

    return () => {
      moveToRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (section) {
      const timeoutId = setTimeout(() => {
        triggerScrollTo(`#${section}`);
      }, 250);

      return () => clearTimeout(timeoutId);
    }
  }, [section, triggerScrollTo]);

  return triggerScrollTo;
}
