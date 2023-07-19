import { useCallback, useState } from 'react';
import useResize from 'hooks/use-resize';

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
};

export default function useDeviceInfo() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.tablet);

  const handleResize = useCallback(() => {
    setWidth(window.innerWidth);
  });
  useResize(handleResize);

  return {
    isMobile: width < BREAKPOINTS.mobile,
    isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
    isDesktop: width >= BREAKPOINTS.tablet
  }
}
