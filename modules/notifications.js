import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createApiInitialState } from 'utils/redux-helpers';
import API from 'services/api';

export const getNotifications = createApiThunk('notifications/getNotifications', 'notifications');

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: createApiInitialState([]),
  reducers: {
    setNotifications: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = false;
    },
  },
  extraReducers: (builder) => {
    addApiCases(getNotifications)(builder);
  },
});

export const { setNotifications } = notificationsSlice.actions;

export function dismissAll() {
  return (dispatch, getState) => {
    const { notifications } = getState();

    notifications.data.forEach((notification) => {
      API.put(`notifications/${notification.id}/dismiss`);
    })
    dispatch(setNotifications([]));
  }
}

export default notificationsSlice.reducer;
