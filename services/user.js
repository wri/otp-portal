import API from 'services/api';
import { fetchApi } from 'services/fetch-api';
import { omitBy, isEmpty } from 'utils/general';
import { logEvent } from 'utils/analytics';

const OPERATOR_FMU_FIELDS = [
  'name',
  'certification-fsc',
  'certification-olb',
  'certification-pefc',
  'certification-pafc',
  'certification-pbn',
  'certification-fsc-cw',
  'certification-tlv',
  'certification-ls',
].join(',');

export function fetchUserOperator(id, locale) {
  return fetchApi(`operators/${id}`, {
    locale,
    auth: true,
    params: { include: 'country,fmus', 'fields[fmus]': OPERATOR_FMU_FIELDS }
  });
}

export function fetchUserProfile(userId) {
  return fetchApi(`users/${userId}`, { auth: true });
}

export function login({ body }) {
  return API.post('login', {
    body,
    headers: { 'Content-Type': 'application/json' },
    deserialize: false,
    skipUnauthorizedHandler: true
  }).then(() => {
    localStorage.removeItem('notificationsShown');
    logEvent('login', { method: 'credentials' });
  });
}

export function logout() {
  return API.delete('logout', { deserialize: false }).then(() => {
    window.location.reload();
  });
}

export function resetPassword(attributes) {
  return API.post('users/password', { body: { password: attributes } });
}

export function forgotPassword(email) {
  return API.post('reset-password', { body: { password: { email } } });
}

export function saveUser({ body }) {
  return API.post('register', { body });
}

export function setDownloadCookie() {
  return API.post('sessions/download-session', { deserialize: false });
}

export function updateUserProfile(userId, { attributes }) {
  return API.patch(`users/${userId}`, {
    body: {
      data: {
        id: userId,
        type: 'users',
        attributes: omitBy(attributes, isEmpty)
      }
    }
  });
}
