import API from 'services/api';

export default class SawmillsService {
  constructor(options = {}) {
    this.opts = options;
  }

  saveSawmill({ id, body }) {
    if (id) {
      return API.patch(`sawmills/${id}`, { body, token: this.opts.authorization });
    }
    return API.post('sawmills', { body, token: this.opts.authorization });
  }

  deleteSawmill(id) {
    return API.delete(`sawmills/${id}`, { token: this.opts.authorization });
  }
}

