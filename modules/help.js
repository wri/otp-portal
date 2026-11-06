import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createNestedApiInitialState } from 'utils/redux-helpers';
import { registerReducer } from 'modules/registry';

export const getHowtos = createApiThunk('help/getHowtos', 'how-tos');
export const getTools = createApiThunk('help/getTools', 'tools');
export const getFAQs = createApiThunk('help/getFAQs', 'faqs');
export const getTutorials = createApiThunk('help/getTutorials', 'tutorials');

const initialState = createNestedApiInitialState(['howtos', 'tools', 'faqs', 'tutorials']);

const helpSlice = createSlice({
  name: 'help',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    addApiCases(getHowtos, 'howtos')(builder);
    addApiCases(getTools, 'tools')(builder);
    addApiCases(getFAQs, 'faqs')(builder);
    addApiCases(getTutorials, 'tutorials')(builder);
  },
});

registerReducer('help', helpSlice.reducer);

export default helpSlice.reducer;
