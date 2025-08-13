import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
    data: {},
    loading: false,
    error: false,
    documentation: {
      data: {},
      loading: false,
      error: false
    },
    links: {
      data: [],
      loading: false,
      error: false
    },
    vpas: {
      data: [],
      loading: false,
      error: false
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCountry.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getCountry.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = false;
      })
      .addCase(getCountry.rejected, (state) => {
        state.error = true;
        state.loading = false;
      })
      .addCase(getCountryLinks.pending, (state) => {
        state.links.loading = true;
        state.links.error = false;
      })
      .addCase(getCountryLinks.fulfilled, (state, action) => {
        state.links.data = action.payload;
        state.links.loading = false;
        state.links.error = false;
      })
      .addCase(getCountryLinks.rejected, (state) => {
        state.links.error = true;
        state.links.loading = false;
      })
      .addCase(getCountryVPAs.pending, (state) => {
        state.vpas.loading = true;
        state.vpas.error = false;
      })
      .addCase(getCountryVPAs.fulfilled, (state, action) => {
        state.vpas.data = action.payload;
        state.vpas.loading = false;
        state.vpas.error = false;
      })
      .addCase(getCountryVPAs.rejected, (state) => {
        state.vpas.error = true;
        state.vpas.loading = false;
      });
  },
});

export default countriesDetailSlice.reducer;
