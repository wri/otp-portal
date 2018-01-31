import 'isomorphic-fetch';
import { post, remove } from 'utils/request';

export default class SawmillsService {
  constructor(options = {}) {
    this.opts = options;
  }

  saveSawmill({ id = '', type, body }) {
    return new Promise((resolve, reject) => {
      post({
        url: `${process.env.OTP_API}/sawmills/${id}`,
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

  deleteSawmill(id, user) {
    return new Promise((resolve, reject) => {
      remove({
        url: `${process.env.OTP_API}/sawmills/${id}`,
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

