import { useEffect } from "react";

import { setDownloadCookie } from 'modules/user';

export function useDownloadSession(enabled) {
  useEffect(() => {
    function updateDownloadCookie() {
      if (enabled) setDownloadCookie();
    }
    updateDownloadCookie();
    const intervalId = setInterval(updateDownloadCookie, 1000 * 60);
    return () => clearInterval(intervalId);
  }, [enabled]);
}
