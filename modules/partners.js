import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from 'services/api';

export const getPartners = createAsyncThunk(
  'partners/getPartners',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('partners', { 'page[size]': 2000 });
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.message);
    }
  }
);

const partnersSlice = createSlice({
  name: 'partners',
  initialState: {
    data: [],
    loading: false,
    error: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPartners.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getPartners.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = false;
      })
      .addCase(getPartners.rejected, (state) => {
        state.error = true;
        state.loading = false;
      });
  },
});

export default partnersSlice.reducer;
