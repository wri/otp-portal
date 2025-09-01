import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createNestedApiInitialState } from 'utils/redux-helpers';
import { omitBy, isEmpty } from 'utils/general';
import API, { NEXTAPIClient } from 'services/api'
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
    useLanguage: false,
    useUserToken: true
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState: createNestedApiInitialState(['userProfile', 'userOperator'], {}),
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    setUserAgent: (state, action) => {
      state.userAgent = action.payload;
    },
    removeUser: () => ({}),
  },
  extraReducers: (builder) => {
    addApiCases(getUserProfile, 'userProfile')(builder);
    addApiCases(getUserOperator, 'userOperator')(builder);
  },
});

export const { setUser, setUserAgent, removeUser } = userSlice.actions;

export function login({ body }) {
  return NEXTAPIClient.post('login', { body }).then(() => {
    localStorage.removeItem('notificationsShown');
    logEvent('login', { method: 'credentials' });
  });
}

export function logout() {
  return () => NEXTAPIClient.delete('logout').then(() => {
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

export function setDownloadCookie(userToken) {
  return NEXTAPIClient.post('sessions/download-session', { token: userToken });
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
      },
      token: user.token
    });
  }
}

export function saveOperator({ body }) {
  return () => API.post('operators', { body });
}

export function updateOperator({ body, id, authorization }) {
  return () => API.patch(`operators/${id}`, { body, token: authorization });
}

export function updateFmu({ id, body, authorization }) {
  return () => API.patch(`fmus/${id}`, { body, token: authorization });
}

export default userSlice.reducer;
