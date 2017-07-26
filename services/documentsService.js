import 'isomorphic-fetch';
import { post, remove } from 'utils/request';

export default class DocumentsService {

  constructor(options = {}) {
    this.opts = options;
  }

  saveDocument({ type, body, id }) {
    return new Promise((resolve, reject) => {
      post({
        url: `${process.env.OTP_API}/operator-documents/${id}`,
        type,
        body,
        headers: [{
          key: 'Content-Type',
          value: 'application/json' // application/vnd.api+json
        }, {
          key: 'Authorization',
          value: this.opts.authorization
        }],
        onSuccess: (response) => {
          resolve(response);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  }

  deleteDocument(id) {
    return new Promise((resolve, reject) => {
      remove({
        url: `${process.env.OTP_API}/operator-documents/${id}`,
        headers: [{
          key: 'Authorization',
          value: this.opts.authorization
        }],
        onSuccess: (response) => {
          resolve(response);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  }
}
