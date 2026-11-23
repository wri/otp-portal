import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createServiceThunk, createNestedApiInitialState } from 'utils/redux-helpers';
import {
  fetchUserOperator,
  fetchUserProfile,
  logout as logoutUser,
  saveUser as registerUser,
  updateUserProfile as patchUserProfile
} from 'services/user';

export { login, resetPassword, forgotPassword, setDownloadCookie } from 'services/user';

export const getUserOperator = createServiceThunk(
  'user/getUserOperator',
  (id, { language }) => fetchUserOperator(id, language).then((data) => ({ data }))
);

export const getUserProfile = createServiceThunk(
  'user/getUserProfile',
  (_arg, { user }) => fetchUserProfile(user.user_id).then((data) => ({ data }))
);

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
    removeUser: (state) => ({ userAgent: state.userAgent }),
  },
  extraReducers: (builder) => {
    addApiCases(getUserProfile, 'userProfile')(builder);
    addApiCases(getUserOperator, 'userOperator')(builder);
  },
});

export const { setUser, setUserAgent, removeUser } = userSlice.actions;

export function logout() {
  return () => logoutUser();
}

export function saveUser({ body }) {
  return () => registerUser({ body });
}

export function updateUserProfile({ attributes }) {
  return (dispatch, getState) => patchUserProfile(getState().user.user_id, { attributes });
}

export default userSlice.reducer;
