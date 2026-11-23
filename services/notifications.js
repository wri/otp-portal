import API from 'services/api';

export function dismissNotification(id) {
  return API.put(`notifications/${id}/dismiss`);
}
