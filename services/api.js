class API {
  get(endpoint, params = {}) {
    return this._request(endpoint, 'GET', { queryParams: params });
  }

  post(endpoint) {
    return this._request(endpoint, 'POST');
  }

  put(endpoint) {
    return this._request(endpoint, 'PUT');
  }

  delete(endpoint) {
    return this._request(endpoint, 'DELETE');
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

    return fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      },
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
