import { getCookie } from 'services/cookies';

// Double submit cookie CSRF protection: the API sets the token in a JS-readable
// XSRF-TOKEN cookie, and expects it echoed back in the X-XSRF-TOKEN header on
// every state-changing request.
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';

const getCsrfToken = (serverCookie) => {
  // State-changing requests happen client-side, where getCookie reads
  // document.cookie. On the server (rare) the caller can pass options.cookie.
  return getCookie(CSRF_COOKIE_NAME, serverCookie);
};

// When a client-side request comes back 401 (e.g. the session cookie expired
// while the user was browsing), the app's Redux user state is stale: the UI
// still thinks we're logged in but every API call fails. The host app registers
// a handler here to reconcile that state (clear the user / reload).
let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export class APIError extends Error {
  constructor(response, responseJSON) {
    const message = responseJSON?.errors?.[0]?.title || response.statusText || 'APIError';
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }

    this.status = response.status;
    this.statusText = response.statusText;
    this.errors = responseJSON.errors;
  }
}

class API {
  constructor(options = {}) {
    this.baseURL = options.baseURL;
    this.headers = options.headers || {};
    this.deserialize = options.deserialize || false;
  }

  async initialize() {
    if (this.JSONA) return;

    const Jsona = await import('jsona');
    this.JSONA = new Jsona.default();
  }

  get(endpoint, params = {}, options = {}) {
    return this._request(endpoint, 'GET', { queryParams: params, ...options });
  }

  post(endpoint, options = {}) {
    return this._request(endpoint, 'POST', options);
  }

  put(endpoint, options = {}) {
    return this._request(endpoint, 'PUT', options);
  }

  patch(endpoint, options = {}) {
    return this._request(endpoint, 'PATCH', options);
  }

  delete(endpoint, options = {}) {
    return this._request(endpoint, 'DELETE', options);
  }

  async _request(endpoint, method, options = {}) {
    const url = new URL(`${this.baseURL}/${endpoint}`);
    if (options.queryParams && typeof options.queryParams === 'object' && Object.keys(options.queryParams).length > 0) {
      Object.keys(options.queryParams).forEach((key) => {
        let value = options.queryParams[key];
        if (key === 'locale') {
          value = value === 'zh' ? 'zh-CN' : value;
        }
        if (value !== null && typeof value !== 'undefined') {
          url.searchParams.set(key, value);
        }
      });
    }
    // Requests carry the session by default. `auth: false` opts out, so an endpoint
    // that has both a public and a user-scoped shape returns the public one even
    // while somebody is logged in (the old code did this by omitting the token).
    const auth = options.auth !== false;
    const headers = { ...this.headers, ...(options.headers || {}) };
    if (auth && options.cookie) {
      headers.cookie = options.cookie;
    }
    if (method !== 'GET' && method !== 'HEAD') {
      const csrfToken = getCsrfToken(options.cookie);
      if (csrfToken) {
        headers[CSRF_HEADER_NAME] = csrfToken;
      }
    }
    const fetchParams = {
      method,
      headers,
      credentials: auth ? 'include' : 'omit'
    };
    if (options.body) {
      fetchParams.body = JSON.stringify(options.body);
    }
    let deserialize = this.deserialize;
    if (options.deserialize !== undefined && options.deserialize !== null) {
      deserialize = options.deserialize;
    }

    await this.initialize();

    return fetch(url.toString(), fetchParams).then(this._handleResponse).then((jsonResponse) => {
      if (deserialize) {
        return { data: this.JSONA.deserialize(jsonResponse), response: jsonResponse };
      }
      return { data: jsonResponse, response: jsonResponse };
    }).catch((err) => {
      if (
        err instanceof APIError &&
        err.status === 401 &&
        !options.skipUnauthorizedHandler &&
        typeof window !== 'undefined' &&
        unauthorizedHandler
      ) {
        unauthorizedHandler(err);
      }
      throw err;
    });
  }

  async _handleResponse(response) {
    if (typeof response.json === 'function') {
      const json = await response.json().catch(() => ({}));
      if (response.ok) return json;
      throw new APIError(response, json);
    }
    if (response.ok) return response;

    throw new APIError(response, {});
  }
}

// OTP_API is the public url, so a server side call leaves the box and comes back
// through nginx - paying dns, a tls handshake and crypto over the whole body - to
// reach rails on localhost. OTP_API_SERVER goes straight there; unset, this is
// exactly the old behaviour. The browser always uses the public url.
const internalAPI = typeof window === 'undefined' ? process.env.OTP_API_SERVER : null;

const APIClient = new API({
  baseURL: internalAPI || process.env.OTP_API,
  headers: {
    'Content-Type': 'application/vnd.api+json',
    'OTP-API-KEY': process.env.OTP_API_KEY,
    // Going direct means rails no longer gets the headers nginx sets, and
    // config.force_ssl would 301 a plain http request. This is the one that
    // matters; Host is not, because asset urls come from the API's APP_URL.
    ...(internalAPI ? { 'X-Forwarded-Proto': 'https' } : {})
  },
  deserialize: true
});

export { APIClient };

export default APIClient;
