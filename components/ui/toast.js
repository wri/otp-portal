import React, { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';

import { subscribe, getToasts, getServerToasts } from 'services/toast';

// Toasts are rare, so their markup loads on the first one instead of on every page.
const ToastList = dynamic(() => import('components/ui/toast-list'), { ssr: false });

const Toast = () => {
  const toasts = useSyncExternalStore(subscribe, getToasts, getServerToasts);
  if (!toasts.length) return null;

  return <ToastList toasts={toasts} />;
};

export default Toast;
