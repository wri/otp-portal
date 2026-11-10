import { useSyncExternalStore } from 'react';

// false on the server and while hydrating, true afterwards
const subscribe = () => () => {};

export default function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
