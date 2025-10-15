import { useEffect } from "react";

import { setDownloadCookie } from 'modules/user';

export function useDownloadSession(userToken) {
  useEffect(() => {
    function updateDownloadCookie() {
      if (userToken) setDownloadCookie();
    }
    updateDownloadCookie();
    const intervalId = setInterval(updateDownloadCookie, 1000 * 60);
    return () => clearInterval(intervalId);
  }, [userToken]);
}
