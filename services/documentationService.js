import API from 'services/api';

export default class DocumentationService {

  constructor(options = {}) {
    this.opts = options;
  }

  saveDocument({ url, body }) {
    return API.patch(url, { body, token: this.opts.authorization });
  }

  deleteDocument(id, path = 'operator-documents') {
    return API.delete(`${path}/${id}`, { token: this.opts.authorization });
  }

  saveAnnex({ url, body }) {
    return API.post(url, { body, token: this.opts.authorization });
  }

  deleteAnnex(id) {
    return API.delete(`operator-document-annexes/${id}`, { token: this.opts.authorization });
  }
}
