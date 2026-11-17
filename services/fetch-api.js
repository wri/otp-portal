import API from 'services/api';

// Browser only: lets tabs and back-navigation reuse what an earlier page load fetched.
// The server must not share responses between requests.
const cache = new Map();

// CMS-like content (about, help, country pages): instant revisits, fresh again after a while
export const CONTENT_MAX_AGE = 5 * 60 * 1000;

/**
 * GET an API endpoint and resolve with the deserialized data.
 * `auth`: send the session; public lists stay public for a logged-in user unless asked.
 * `cache`: true reuses a browser response for the session, a number of ms only for that long,
 * and 'reload' refetches and stores it.
 * `meta`: resolve with { data, meta } for endpoints whose paging info is in the response meta.
 */
export async function fetchApi(endpoint, { locale, params = {}, auth = false, cache: cacheMode = false, meta = false, ...requestOptions } = {}) {
  const queryParams = { ...(locale && { locale }), ...params };
  const options = { ...requestOptions, auth };
  if (auth && typeof window === 'undefined') {
    const { getRequestCookie } = await import('services/request-context');
    const cookie = getRequestCookie();
    if (cookie) options.cookie = cookie;
  }

  const request = () => API.get(endpoint, queryParams, options)
    .then(({ data, response }) => (meta ? { data, meta: response.meta } : data));
  if (!cacheMode || typeof window === 'undefined') return request();

  const key = JSON.stringify([endpoint, queryParams, auth, meta]);
  const cached = cache.get(key);
  const fresh = cached && (cacheMode === true || Date.now() - cached.at < cacheMode);
  if (cacheMode !== 'reload' && fresh) return cached.pending;

  const pending = request();
  const entry = { pending, at: Date.now() };
  cache.set(key, entry);
  pending.catch(() => {
    if (cache.get(key) === entry) cache.delete(key);
  });
  return pending;
}

// { data, error } page props, so a failed request still renders the page with the fallback.
export function settle(promise, fallback) {
  return promise.then(
    (data) => ({ data, error: false }),
    (error) => {
      console.error(error);
      return { data: fallback, error: true };
    }
  );
}
