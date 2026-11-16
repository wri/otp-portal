import API from 'services/api';

// Browser only: lets tabs and back-navigation reuse what an earlier page load fetched, as the
// Redux store used to. The server must not share responses between requests.
const cache = new Map();

/**
 * GET an API endpoint and resolve with the deserialized data.
 * `auth`: send the session; public lists stay public for a logged-in user unless asked.
 * `cache`: true reuses a browser response for the session, 'reload' refetches and stores it.
 */
export async function fetchApi(endpoint, { locale, params = {}, auth = false, cache: cacheMode = false, ...requestOptions } = {}) {
  const queryParams = { ...(locale && { locale }), ...params };
  const options = { ...requestOptions, auth };
  if (auth && typeof window === 'undefined') {
    const { getRequestCookie } = await import('services/request-context');
    const cookie = getRequestCookie();
    if (cookie) options.cookie = cookie;
  }

  const request = () => API.get(endpoint, queryParams, options).then(({ data }) => data);
  if (!cacheMode || typeof window === 'undefined') return request();

  const key = JSON.stringify([endpoint, queryParams, auth]);
  if (cacheMode !== 'reload' && cache.has(key)) return cache.get(key);

  const pending = request();
  cache.set(key, pending);
  pending.catch(() => {
    if (cache.get(key) === pending) cache.delete(key);
  });
  return pending;
}

// The { data, error } shape components got from the store, so a failed request renders as before.
export function settle(promise, fallback) {
  return promise.then(
    (data) => ({ data, error: false }),
    (error) => {
      console.error(error);
      return { data: fallback, error: true };
    }
  );
}
