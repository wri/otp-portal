import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createApiInitialState } from 'utils/redux-helpers';
import { registerReducer } from 'modules/registry';

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

registerReducer('partners', partnersSlice.reducer);

export default partnersSlice.reducer;
