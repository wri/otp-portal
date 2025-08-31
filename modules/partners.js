import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createApiInitialState } from 'utils/redux-helpers';

export const getPartners = createApiThunk('partners/getPartners', 'partners', {
  useLanguage: false,
  params: { 'page[size]': 2000 }
});

const partnersSlice = createSlice({
  name: 'partners',
  initialState: createApiInitialState([]),
  reducers: {},
  extraReducers: (builder) => {
    addApiCases(getPartners)(builder);
  },
});

export default partnersSlice.reducer;
