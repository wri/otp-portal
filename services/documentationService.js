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

  addAnnex({ body }) {
    return API.post('operator-document-annexes', { body, token: this.opts.authorization });
  }

  editAnnex({ id, body }) {
    return API.patch(`operator-document-annexes/${id}`, { body, token: this.opts.authorization });
  }

  deleteAnnex(id) {
    return API.delete(`operator-document-annexes/${id}`, { token: this.opts.authorization });
  }
}
