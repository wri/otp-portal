export const logEvent = (event, params = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ event, ...params });
  }
}

export const pageview = (params = {}) => {
  console.info('[GTM PageView] - Custom', params);
  logEvent('page_view');
}
