import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router'

import { pageview } from 'utils/analytics';

function shouldTrack(url, prevUrl) {
  // do not track not page changes
  if (url === prevUrl) return false;
  // do not track extra pageviews when on the map page and changing parameters
  if (url.includes("/operators?") && prevUrl.includes("/operators")) return false;
  if (url.includes("/database?") && prevUrl.includes("/database")) return false;
  if (url.includes("/observations?") && prevUrl.includes("/observations")) return false;

  return true;
}

const PageViewTracking = () => {
  const router = useRouter();
  const previousUrl = useRef(null);

  useEffect(() => {
    const handleRouteStart = () => {
      previousUrl.current = router.asPath;
    }
    const handleRouteChange = (url, params) => {
      if (shouldTrack(url, previousUrl.current)) {
        pageview({ url, params, previousUrl: previousUrl.current });
      }
    }
    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  return null;
}

export default PageViewTracking;
