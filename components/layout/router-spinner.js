import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router'

import Spinner from 'components/ui/spinner';

const SHOW_AFTER = 300; // ms

function skipSpinner(url, prevUrl) {
  if (!prevUrl || !url) return false;
  if (url.includes("/operators?") && prevUrl.includes("/operators")) return true;

  return false;
}

const RouterSpinner = () => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);

  const previousUrl = useRef(null);
  const mounted = useRef(false);
  const initiated = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const showSpinner = (url) => {
      if (skipSpinner(url, previousUrl.current)) return;

      initiated.current = true;
      previousUrl.current = router.asPath;
      setTimeout(() => {
        if (initiated.current) {
          setLoading(true);
        }
      }, SHOW_AFTER);
    }
    const hideSpinner = () => {
      setLoading(false);
      initiated.current = false;
    }
    router.events.on("routeChangeStart", showSpinner);
    router.events.on("routeChangeComplete", hideSpinner);
    router.events.on("routeChangeError", hideSpinner);

    return () => {
      router.events.off("routeChangeStart", showSpinner);
      router.events.off("routeChangeComplete", hideSpinner);
      router.events.off("routeChangeError", hideSpinner);
    };
  }, []);

  return <Spinner isLoading={isLoading} className="-fixed" spinDelay={0} />;
}

export default RouterSpinner;
