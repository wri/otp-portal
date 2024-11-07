import get from 'lodash/get';

export class APIError extends Error {
  constructor(response, responseJSON) {
    const message = get(responseJSON, 'errors[0].title') || response.statusText || 'APIError';
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
    const headers = { ...this.headers };
    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`
    }
    const fetchParams = {
      method,
      headers
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
    })
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

const APIClient = new API({
  baseURL: process.env.OTP_API,
  headers: {
    'Content-Type': 'application/vnd.api+json',
    'OTP-API-KEY': process.env.OTP_API_KEY
  },
  deserialize: true
});
const NEXTAPIClient = new API({
  baseURL: process.env.APP_URL + "/portal-api",
  headers: {
    'Content-Type': 'application/json',
    'OTP-API-KEY': process.env.OTP_API_KEY
  }
});

export { NEXTAPIClient, APIClient };

export default APIClient;
