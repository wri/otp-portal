export const logEvent = (event, params = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ event, ...params });
  }
}

export const pageview = (params = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    console.info('[GTM PageView] - Custom', params);
  }

  logEvent('page_view');
}
