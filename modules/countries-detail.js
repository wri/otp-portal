import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk, createApiInitialState } from 'utils/redux-helpers';

export const getCountry = createApiThunk(
  'countriesDetail/getCountry',
  (id) => `countries/${id}`,
  {
    useUserToken: true,
    params: {
      include: [
        'governments',
        'required-gov-documents',
        'required-gov-documents.required-gov-document-group',
        'required-gov-documents.required-gov-document-group.parent',
        'required-gov-documents.gov-documents'
      ].join(',')
    }
  }
);

export const getCountryLinks = createApiThunk(
  'countriesDetail/getCountryLinks',
  'country-links',
  {
    useUserToken: true,
    params: (id) => ({
      country: id
    })
  }
);

export const getCountryVPAs = createApiThunk(
  'countriesDetail/getCountryVPAs',
  'country-vpas',
  {
    useUserToken: true,
    params: (id) => ({
      country: id
    })
  }
);

const countriesDetailSlice = createSlice({
  name: 'countriesDetail',
  initialState: {
    ...createApiInitialState({}),
    documentation: createApiInitialState({}),
    links: createApiInitialState([]),
    vpas: createApiInitialState([])
  },
  reducers: {},
  extraReducers: (builder) => {
    addApiCases(getCountry)(builder);
    addApiCases(getCountryLinks, 'links')(builder);
    addApiCases(getCountryVPAs, 'vpas')(builder);
  },
});

export default countriesDetailSlice.reducer;
