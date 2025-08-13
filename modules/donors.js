import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from 'services/api';

export const getDonors = createAsyncThunk(
  'donors/getDonors',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { language } = getState();
      const { data } = await API.get('donors', { locale: language, 'page[size]': 2000 });
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.message);
    }
  }
);

const donorsSlice = createSlice({
  name: 'donors',
  initialState: {
    data: [],
    loading: false,
    error: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDonors.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getDonors.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = false;
      })
      .addCase(getDonors.rejected, (state) => {
        state.error = true;
        state.loading = false;
      });
  },
});

export default donorsSlice.reducer;
