import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createNestedApiInitialState } from 'utils/redux-helpers';
import { omitBy, isEmpty } from 'utils/general';
import API from 'services/api'
import { logEvent } from 'utils/analytics';

export const getUserOperator = createApiThunk(
  'user/getUserOperator',
  (id) => `operators/${id}`,
  {
    params: () => {
      const includeFields = ['country', 'fmus'];
      const fields = {
        fmus: [
          'name',
          'certification-fsc',
          'certification-olb',
          'certification-pefc',
          'certification-pafc',
          'certification-pbn',
          'certification-fsc-cw',
          'certification-tlv',
          'certification-ls',
        ],
      };

      return {
        include: includeFields.join(','),
        'fields[fmus]': fields.fmus.join(',')
      }
    }
  }
)

export const getUserProfile = createApiThunk(
  'user/getUserProfile',
  (_arg, { user }) => `users/${user.user_id}`,
  {
    useLanguage: false
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState: {
    ...createNestedApiInitialState(['userProfile', 'userOperator'], {}),
    // Prerendered pages never run the server-side UA parse, and selectors read
    // userAgent.isMobile during render - without a default that throws.
    userAgent: { ua: '', isMobile: false }
  },
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    setUserAgent: (state, action) => {
      state.userAgent = action.payload;
    },
    removeUser: (state) => ({ userAgent: state.userAgent }),
  },
  extraReducers: (builder) => {
    addApiCases(getUserProfile, 'userProfile')(builder);
    addApiCases(getUserOperator, 'userOperator')(builder);
  },
});

export const { setUser, setUserAgent, removeUser } = userSlice.actions;

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
  return () => API.delete('logout', { deserialize: false }).then(() => {
    window.location.reload();
  })
}

export function resetPassword(attributes) {
  return API.post('users/password', {
    body: {
      password: attributes
    }
  });
}

export function forgotPassword(email) {
  return API.post('reset-password', { body: { password: { email } } });
}

export function saveUser({ body }) {
  return () => API.post('register', { body });
}

export function setDownloadCookie() {
  return API.post('sessions/download-session', { deserialize: false });
}

export function updateUserProfile({ attributes }) {
  return (dispatch, getState) => {
    const { user } = getState();

    return API.patch(`users/${user.user_id}`, {
      body: {
        data: {
          id: user.user_id,
          type: 'users',
          attributes: omitBy(attributes, isEmpty)
        }
      }
    });
  }
}

export function saveOperator({ body }) {
  return () => API.post('operators', { body });
}

export function updateOperator({ body, id, locale }) {
  return () => API.patch(`operators/${id}`, { body, queryParams: { locale }});
}

export function updateFmu({ id, body }) {
  return () => API.patch(`fmus/${id}`, { body });
}

export default userSlice.reducer;
