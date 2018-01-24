import 'isomorphic-fetch';
import { post, remove } from 'utils/request';

export default class DocumentationService {

  constructor(options = {}) {
    this.opts = options;
  }

  saveDocument({ url, type, body }) {
    return new Promise((resolve, reject) => {
      post({
        url: `${process.env.OTP_API}/${url}`,
        type,
        body,
        headers: [{
          key: 'Content-Type',
          value: 'application/vnd.api+json' // application/vnd.api+json
        }, {
          key: 'Authorization',
          value: `Bearer ${this.opts.authorization}`
        }, {
          key: 'OTP-API-KEY',
          value: process.env.OTP_API_KEY
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
          key: 'Content-Type',
          value: 'application/json'
        }, {
          key: 'Authorization',
          value: `Bearer ${this.opts.authorization}`
        }, {
          key: 'OTP-API-KEY',
          value: process.env.OTP_API_KEY
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

  saveAnnex({ url, type, body }) {
    return new Promise((resolve, reject) => {
      post({
        url: `${process.env.OTP_API}/${url}`,
        type,
        body,
        headers: [{
          key: 'Content-Type',
          value: 'application/vnd.api+json' // application/vnd.api+json
        }, {
          key: 'Authorization',
          value: `Bearer ${this.opts.authorization}`
        }, {
          key: 'OTP-API-KEY',
          value: process.env.OTP_API_KEY
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

  deleteAnnex(id, user) {
    return new Promise((resolve, reject) => {
      remove({
        url: `${process.env.OTP_API}/operator-document-annexes/${id}`,
        headers: [{
          key: 'Content-Type',
          value: 'application/json'
        }, {
          key: 'Authorization',
          value: `Bearer ${user.token}`
        }, {
          key: 'OTP-API-KEY',
          value: process.env.OTP_API_KEY
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
