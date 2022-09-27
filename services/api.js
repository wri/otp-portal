class API {
  get(endpoint, params = {}, options = {}) {
    return this._request(endpoint, 'GET', { queryParams: params, ...options });
  }

  post(endpoint, options = {}) {
    return this._request(endpoint, 'POST', options);
  }

  put(endpoint, options = {}) {
    return this._request(endpoint, 'PUT', options);
  }

  delete(endpoint, options = {}) {
    return this._request(endpoint, 'DELETE', options);
  }

  _request(endpoint, method, options = {}) {
    const url = new URL(`${process.env.OTP_API}/${endpoint}`);
    if (typeof options.queryParams === 'object' && Object.keys(options.queryParams).length > 0) {
      Object.keys(options.queryParams).forEach((key) => {
        let value = options.queryParams[key];
        if (key === 'locale') {
          value = value === 'zh' ? 'zh-CN' : value;
        }
        url.searchParams.set(key, value);
      });
    }
    const headers = {
      'Content-Type': 'application/json',
      'OTP-API-KEY': process.env.OTP_API_KEY
    };
    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`
    }

    return fetch(url.toString(), {
      method,
      headers
    })
      .then(this._handleResponse)
  }

  _handleResponse(response) {
    if (response.ok) {
      const data = typeof response.json === 'function' ? response.json() : response;
      return data;
    }
    throw new Error(response.statusText);
  }
}

const APIclient = new API();

export default APIclient;
