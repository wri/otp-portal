import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createApiInitialState } from 'utils/redux-helpers';

export const getAbout = createApiThunk('about/getAbout', 'about-page-entries');

const aboutSlice = createSlice({
  name: 'about',
  initialState: createApiInitialState([]),
  reducers: {},
  extraReducers: (builder) => {
    addApiCases(getAbout)(builder);
  },
});

export default aboutSlice.reducer;
