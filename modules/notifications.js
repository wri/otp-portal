import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createApiInitialState } from 'utils/redux-helpers';
import { dismissNotification } from 'services/notifications';

export const getNotifications = createApiThunk('notifications/getNotifications', 'notifications', { auth: true });

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

    notifications.data.forEach((notification) => dismissNotification(notification.id));
    dispatch(setNotifications([]));
  }
}

export default notificationsSlice.reducer;
