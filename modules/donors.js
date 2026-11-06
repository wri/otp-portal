import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createApiInitialState } from 'utils/redux-helpers';
import { registerReducer } from 'modules/registry';

export const getDonors = createApiThunk('donors/getDonors', 'donors', {
  params: { 'page[size]': 2000 }
});

const donorsSlice = createSlice({
  name: 'donors',
  initialState: createApiInitialState([]),
  reducers: {},
  extraReducers: (builder) => {
    addApiCases(getDonors)(builder);
  },
});

registerReducer('donors', donorsSlice.reducer);

export default donorsSlice.reducer;
