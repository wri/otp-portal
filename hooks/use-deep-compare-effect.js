import { useEffect, useRef } from 'react';
import isEqual from 'react-fast-compare';

export default function useDeepCompareEffect(effectFunc, deps) {
  const isFirst = useRef(true);
  const prevDeps = useRef(deps);

  useEffect(() => {
    const isSame = prevDeps.current.every((obj, index) => isEqual(obj, deps[index]));
    if (isFirst.current || !isSame) {
      effectFunc();
    }
    isFirst.current = false;
    prevDeps.current = deps;
  }, deps);
}
