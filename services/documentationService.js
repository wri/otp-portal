import API from 'services/api';

export default class DocumentationService {

  saveDocument({ url, body }) {
    return API.patch(url, { body });
  }

  deleteDocument(id, path = 'operator-documents') {
    return API.delete(`${path}/${id}`);
  }

  addAnnex({ body }) {
    return API.post('operator-document-annexes', { body });
  }

  editAnnex({ id, body }) {
    return API.patch(`operator-document-annexes/${id}`, { body });
  }

  deleteAnnex(id) {
    return API.delete(`operator-document-annexes/${id}`);
  }
}
