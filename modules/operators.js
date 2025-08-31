import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createApiInitialState } from 'utils/redux-helpers';

export const getOperators = createApiThunk('operators/getOperators', 'operators', {
  params: {
    include: 'country',
    'page[size]': 3000,
    'filter[country]': process.env.OTP_COUNTRIES_IDS,
    'filter[fa]': true,
    'fields[operators]': 'name,slug,country',
    'fields[countries]': 'name',
  }
});

const operatorsSlice = createSlice({
  name: 'operators',
  initialState: createApiInitialState([]),
  reducers: {},
  extraReducers: (builder) => {
    addApiCases(getOperators)(builder);
  },
});

export default operatorsSlice.reducer;
