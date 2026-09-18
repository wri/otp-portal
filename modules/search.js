import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createNestedApiInitialState } from 'utils/redux-helpers';

// Fetched lazily on first search modal open; the API has no free-text filter
// for FMUs, so they are indexed client-side like producers.
export const getSearchFmus = createApiThunk('search/getSearchFmus', 'fmus', {
  params: {
    include: 'operator,country',
    'filter[country]': process.env.OTP_COUNTRIES_IDS,
    'fields[fmus]': 'name,operator,country',
    'fields[operators]': 'name,slug',
    'fields[countries]': 'name'
  }
});

const searchSlice = createSlice({
  name: 'search',
  initialState: createNestedApiInitialState(['fmus']),
  reducers: {},
  extraReducers: (builder) => {
    addApiCases(getSearchFmus, 'fmus')(builder);
  }
});

export default searchSlice.reducer;
