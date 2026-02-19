import { useCallback, useState } from 'react';
import useResize from 'hooks/use-resize';

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
};

const getCategory = (width) => {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
};

export default function useDeviceInfo() {
  const [category, setCategory] = useState(
    typeof window !== 'undefined' ? getCategory(window.innerWidth) : 'mobile'
  );

  const handleResize = useCallback(() => {
    setCategory(prev => {
      const next = getCategory(window.innerWidth);
      return prev === next ? prev : next;
    });
  }, []);
  useResize(handleResize);

  return {
    isMobile: category === 'mobile',
    isTablet: category === 'tablet',
    isDesktop: category === 'desktop',
    isServer: typeof window === 'undefined',
  }
}

export const withDeviceInfo = Component => {
  const NewComponent = props => {
    const deviceInfo = useDeviceInfo();
    return <Component {...props} deviceInfo={deviceInfo} />;
  };
  NewComponent.getInitialProps = Component.getInitialProps;
  return NewComponent;
}
