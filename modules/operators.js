import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from 'services/api'

export const getOperators = createAsyncThunk(
  'operators/getOperators',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { language } = getState();
      const { data } = await API.get('operators', {
        locale: language,
        include: 'country',
        'page[size]': 3000,
        'filter[country]': process.env.OTP_COUNTRIES_IDS,
        'filter[fa]': true,
        'fields[operators]': 'name,slug,country',
        'fields[countries]': 'name',
      });
      return data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.message);
    }
  }
);

const operatorsSlice = createSlice({
  name: 'operators',
  initialState: {
    data: [],
    loading: false,
    error: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOperators.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getOperators.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = false;
      })
      .addCase(getOperators.rejected, (state) => {
        state.error = true;
        state.loading = false;
      });
  },
});

export default operatorsSlice.reducer;
