import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createApiInitialState } from 'utils/redux-helpers';

export const getCountries = createApiThunk('countries/getCountries', 'countries', {
  params: {
    include: 'required-gov-documents',
    'fields[required-gov-documents]': 'id',
    'page[size]': 2000,
    sort: 'name'
  }
});

const countriesSlice = createSlice({
  name: 'countries',
  initialState: createApiInitialState([]),
  reducers: {},
  extraReducers: (builder) => {
    addApiCases(getCountries)(builder);
  },
});

export default countriesSlice.reducer;
