class API {
  constructor(options = {}) {
    this.baseURL = options.baseURL;
    this.headers = options.headers || {};
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

  _request(endpoint, method, options = {}) {
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

    return fetch(url.toString(), fetchParams).then(this._handleResponse)
  }

  _handleResponse(response) {
    if (response.ok) {
      if (typeof response.json === 'function') {
        return response.json().catch(() => ({}));
      }

      return response;
    }
    throw new Error(response.statusText);
  }
}

const APIClient = new API({
  baseURL: process.env.OTP_API,
  headers: {
    'Content-Type': 'application/vnd.api+json',
    'OTP-API-KEY': process.env.OTP_API_KEY
  }
});
const NEXTAPIClient = new API({
  baseURL: process.env.APP_URL,
  headers: {
    'Content-Type': 'application/json',
    'OTP-API-KEY': process.env.OTP_API_KEY
  }
});

export { NEXTAPIClient, APIClient };

export default APIClient;
