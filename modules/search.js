import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createNestedApiInitialState } from 'utils/redux-helpers';

// Fetched lazily on first search modal open; the API has no free-text filter
// for these, so they are indexed client-side like producers.
export const getSearchFmus = createApiThunk('search/getSearchFmus', 'fmus', {
  params: {
    include: 'operator,country',
    'filter[country]': process.env.OTP_COUNTRIES_IDS,
    'fields[fmus]': 'name,operator,country',
    'fields[operators]': 'name,slug',
    'fields[countries]': 'name'
  }
});

export const getSearchObservationReports = createApiThunk('search/getSearchObservationReports', 'observation-reports', {
  params: {
    'page[size]': 3000,
    sort: '-publication-date',
    include: 'observers',
    'fields[observation-reports]': 'title,publication-date,observers',
    'fields[observers]': 'name'
  }
});

const searchSlice = createSlice({
  name: 'search',
  initialState: createNestedApiInitialState(['fmus', 'observationReports']),
  reducers: {},
  extraReducers: (builder) => {
    addApiCases(getSearchFmus, 'fmus')(builder);
    addApiCases(getSearchObservationReports, 'observationReports')(builder);
  }
});

export default searchSlice.reducer;
