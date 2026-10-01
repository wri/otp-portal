import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createApiInitialState } from 'utils/redux-helpers';
import { registerReducer } from 'modules/registry';

export const getAbout = createApiThunk('about/getAbout', 'about-page-entries');

const aboutSlice = createSlice({
  name: 'about',
  initialState: createApiInitialState([]),
  reducers: {},
  extraReducers: (builder) => {
    addApiCases(getAbout)(builder);
  },
});

registerReducer('about', aboutSlice.reducer);

export default aboutSlice.reducer;
