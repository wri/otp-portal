import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from 'services/api';

export const getCountries = createAsyncThunk(
  'countries/getCountries',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { language } = getState();
      const params = {
        locale: language,
        include: 'required-gov-documents',
        'fields[required-gov-documents]': 'id',
        'page[size]': 2000,
        sort: 'name'
      };

      const { data } = await API.get('countries', params);
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.message);
    }
  }
);

const countriesSlice = createSlice({
  name: 'countries',
  initialState: {
    data: [],
    loading: false,
    error: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCountries.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getCountries.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = false;
      })
      .addCase(getCountries.rejected, (state) => {
        state.error = true;
        state.loading = false;
      });
  },
});

export default countriesSlice.reducer;
