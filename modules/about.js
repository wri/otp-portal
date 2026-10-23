import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createApiInitialState } from 'utils/redux-helpers';
import { registerReducer } from 'modules/registry';

export const getAbout = createApiThunk('about/getAbout', 'pages', {
  params: { 'filter[slug]': 'about', include: 'sections' },
  transformResponse: (data) => ({ data: data[0] || null })
});

const aboutSlice = createSlice({
  name: 'about',
  initialState: createApiInitialState(null),
  reducers: {},
  extraReducers: (builder) => {
    addApiCases(getAbout)(builder);
  },
});

registerReducer('about', aboutSlice.reducer);

export default aboutSlice.reducer;
