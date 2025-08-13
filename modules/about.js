import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from 'services/api';

export const getAbout = createAsyncThunk(
  'about/getAbout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { language } = getState();
      const { data } = await API.get('about-page-entries', { locale: language });
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.message);
    }
  }
);

const aboutSlice = createSlice({
  name: 'about',
  initialState: {
    data: [],
    loading: false,
    error: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAbout.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getAbout.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = false;
      })
      .addCase(getAbout.rejected, (state) => {
        state.error = true;
        state.loading = false;
      });
  },
});

export default aboutSlice.reducer;
