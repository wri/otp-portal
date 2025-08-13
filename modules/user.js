import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { omitBy, isEmpty } from 'utils/general';
import API, { NEXTAPIClient } from 'services/api'
import { logEvent } from 'utils/analytics';

export const getUserOperator = createAsyncThunk(
  'user/getUserOperator',
  async (id, { rejectWithValue }) => {
    try {
      const includeFields = ['country', 'fmus'];
      const fields = {
        fmus: [
          'name',
          'certification-fsc',
          'certification-olb',
          'certification-pefc',
          'certification-pafc',
          'certification-fsc-cw',
          'certification-tlv',
          'certification-ls',
        ],
      };

      const { data } = await API.get(`operators/${id}`, {
        include: includeFields.join(','),
        'fields[fmus]': fields.fmus.join(',')
      });

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'user/getUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState();
      const { data } = await API.get(`users/${user.user_id}`, null, { token: user.token });
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {},
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
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.userProfile = {
          ...state.userProfile,
          loading: true,
          error: false,
        };
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.userProfile = {
          ...state.userProfile,
          data: action.payload,
          loading: false,
          error: false,
        };
      })
      .addCase(getUserProfile.rejected, (state) => {
        state.userProfile = {
          ...state.userProfile,
          error: true,
          loading: false,
        };
      })
      .addCase(getUserOperator.pending, (state) => {
        state.userOperator = {
          ...state.userOperator,
          loading: true,
          error: false,
        };
      })
      .addCase(getUserOperator.fulfilled, (state, action) => {
        state.userOperator = {
          ...state.userOperator,
          data: action.payload,
          loading: false,
          error: false,
        };
      })
      .addCase(getUserOperator.rejected, (state) => {
        state.userOperator = {
          ...state.userOperator,
          error: true,
          loading: false,
        };
      });
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
  return () => API.post('register', { body })
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
