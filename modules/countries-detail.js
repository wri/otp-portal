import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addApiCases, createApiInitialState } from 'utils/redux-helpers';
import API from 'services/api';

export const getCountry = createAsyncThunk(
  'countriesDetail/getCountry',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user, language } = getState();
      const includeFields = [
        'governments',
        'required-gov-documents',
        'required-gov-documents.required-gov-document-group',
        'required-gov-documents.required-gov-document-group.parent',
        'required-gov-documents.gov-documents'
      ];

      const queryParams = {
        ...(!!includeFields.length && { include: includeFields.join(',') }),
        locale: language
      };

      const { data } = await API.get(`countries/${id}`, queryParams, { token: user.token });
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getCountryLinks = createAsyncThunk(
  'countriesDetail/getCountryLinks',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user, language } = getState();
      const queryParams = {
        country: id,
        locale: language
      };

      const { data } = await API.get('country-links', queryParams, { token: user.token });
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getCountryVPAs = createAsyncThunk(
  'countriesDetail/getCountryVPAs',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user, language } = getState();
      const queryParams = {
        country: id,
        locale: language
      };

      const { data } = await API.get('country-vpas', queryParams, { token: user.token });
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
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
