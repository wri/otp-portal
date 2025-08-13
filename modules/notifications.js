import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from 'services/api';

export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { language, user } = getState();
      const { data } = await API.get('notifications', { locale: language }, { token: user.token });
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    data: [],
    loading: false,
    error: false
  },
  reducers: {
    setNotifications: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = false;
      })
      .addCase(getNotifications.rejected, (state) => {
        state.error = true;
        state.loading = false;
      });
  },
});

export const { setNotifications } = notificationsSlice.actions;

export function dismissAll() {
  return (dispatch, getState) => {
    const { user, notifications } = getState();

    notifications.data.forEach((notification) => {
      API.put(`notifications/${notification.id}/dismiss`, { token: user.token });
    })
    dispatch(setNotifications([]));
  }
}

export default notificationsSlice.reducer;
