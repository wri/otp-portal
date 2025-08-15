import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import API from 'services/api';
import { parseDocument } from 'utils/documents';

export const getOperatorBySlug = createAsyncThunk(
  'operatorsDetail/getOperatorBySlug',
  async ({ slug, loadFMUS = false }, { getState, rejectWithValue }) => {
    try {
      const { user, language } = getState();
      const includes = ['country', 'fmus', 'observations'];
      const fields = {
        'fields[countries]': 'name,id,iso',
        'fields[observations]': 'id,hidden'
      };
      if (!loadFMUS) {
        fields['fields[fmus]'] = 'name,id';
      }

      const { data } = await API.get('operators', {
        locale: language,
        include: includes.join(','),
        ...fields,
        'filter[slug]': slug
      }, {
        token: user.token
      });

      const operator = data[0];
      if (!operator) throw new Error('Operator not found');
      operator.loadedFMUS = loadFMUS;

      return operator;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getOperator = createAsyncThunk(
  'operatorsDetail/getOperator',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user, language } = getState();
      const includeFields = ['country', 'fmus'];

      const { data } = await API.get(`operators/${id}`, {
        locale: language,
        include: includeFields.join(','),
      }, {
        token: user.token
      });

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getOperatorDocumentation = createAsyncThunk(
  'operatorsDetail/getOperatorDocumentation',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user, language, operatorsDetail } = getState();
      const date = operatorsDetail.date;
      const metadata = { timestamp: new Date().getTime(), operatorId: id };

      const includeFields = [
        'required-operator-document',
        'required-operator-document.required-operator-document-group',
        'operator-document-annexes',
        'fmu',
      ];

      const { data } = await API.get('operator-document-histories', {
        locale: language,
        include: includeFields.join(','),
        'fields[fmus]': 'name',
        'filter[operator-id]': id,
        'filter[date]': date,
      }, {
        token: user.token
      });

      return { data, metadata };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getOperatorObservations = createAsyncThunk(
  'operatorsDetail/getOperatorObservations',
  async (operatorId, { getState, rejectWithValue }) => {
    try {
      const { language } = getState();
      const includes = [
        'country', 'fmu', 'observers', 'severity', 'subcategory',
        'subcategory.category', 'observation-report', 'observation-documents',
        'relevant-operators', 'operator',
      ];

      const metadata = { timestamp: new Date().getTime(), operatorId };

      const { data } = await API.get('observations', {
        locale: language,
        include: includes.join(','),
        'fields[fmus]': 'name',
        'filter[operator]': operatorId,
        'filter[hidden]': 'all'
      });

      return { data, metadata };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getOperatorPublicationAuthorization = createAsyncThunk(
  'operatorsDetail/getOperatorPublicationAuthorization',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user, language } = getState();
      const includeFields = [
        'required-operator-document',
        'required-operator-document.required-operator-document-group',
      ];

      const { data } = await API.get('operator-documents', {
        locale: language,
        include: includeFields.join(','),
        'filter[operator-id]': id,
        'filter[contract-signature]': true,
      }, {
        token: user.token,
      });

      const doc = data.find((doc) => doc['required-operator-document']['contract-signature']);
      return parseDocument(doc);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getOperatorTimeline = createAsyncThunk(
  'operatorsDetail/getOperatorTimeline',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user, language } = getState();
      const { data } = await API.get('score-operator-documents', {
        locale: language,
        'filter[operator]': id,
      }, {
        token: user.token
      });

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getSawMillsByOperatorId = createAsyncThunk(
  'operatorsDetail/getSawMillsByOperatorId',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await API.get('sawmills', {
        'filter[operator]': id
      });

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getSawMillsLocationByOperatorId = createAsyncThunk(
  'operatorsDetail/getSawMillsLocationByOperatorId',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await API.get('sawmills', {
        'filter[operator]': id,
        format: 'geojson'
      }, { deserialize: false });

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

function isLatestAction(state, action) {
  return action.payload?.metadata?.timestamp >= state.timestamp;
}

const operatorsDetailSlice = createSlice({
  name: 'operatorsDetail',
  initialState: {
    data: {},
    loading: false,
    error: false,
    observations: {
      operatorId: null,
      data: [],
      loading: false,
      error: false,
      timestamp: null
    },
    documentation: {
      operatorId: null,
      data: [],
      loading: false,
      error: false,
      timestamp: null
    },
    publicationAuthorization: null,
    date: dayjs().format('YYYY-MM-DD'),
    fmu: null,
    timeline: [],
    sawmills: {
      data: [],
      loading: false,
      error: false,
    },
    sawmillsLocations: {
      data: [],
      loading: false,
      error: false,
    },
  },
  reducers: {
    setOperatorDocumentationDate: (state, action) => {
      state.date = action.payload;
    },
    setOperatorDocumentationFMU: (state, action) => {
      state.fmu = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // getOperator
      .addCase(getOperator.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getOperator.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = false;
      })
      .addCase(getOperator.rejected, (state) => {
        state.error = true;
        state.loading = false;
      })
      // getOperatorBySlug
      .addCase(getOperatorBySlug.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getOperatorBySlug.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = false;
      })
      .addCase(getOperatorBySlug.rejected, (state) => {
        state.error = true;
        state.loading = false;
      })
      // getOperatorDocumentation
      .addCase(getOperatorDocumentation.pending, (state, action) => {
        state.documentation.loading = true;
        state.documentation.error = false;
        state.documentation.timestamp = action.payload?.metadata?.timestamp || Date.now();
      })
      .addCase(getOperatorDocumentation.fulfilled, (state, action) => {
        if (!isLatestAction(state.documentation, action)) return;
        state.documentation.data = action.payload.data;
        state.documentation.operatorId = action.payload.metadata.operatorId;
        state.documentation.loading = false;
        state.documentation.error = false;
      })
      .addCase(getOperatorDocumentation.rejected, (state, action) => {
        if (!isLatestAction(state.documentation, action)) return;
        state.documentation.error = true;
        state.documentation.loading = false;
      })
      // getOperatorObservations
      .addCase(getOperatorObservations.pending, (state, action) => {
        state.observations.loading = true;
        state.observations.error = false;
        state.observations.timestamp = action.payload?.metadata?.timestamp || Date.now();
      })
      .addCase(getOperatorObservations.fulfilled, (state, action) => {
        if (!isLatestAction(state.observations, action)) return;
        state.observations.data = action.payload.data;
        state.observations.operatorId = action.payload.metadata.operatorId;
        state.observations.loading = false;
        state.observations.error = false;
      })
      .addCase(getOperatorObservations.rejected, (state, action) => {
        if (!isLatestAction(state.observations, action)) return;
        state.observations.error = true;
        state.observations.loading = false;
      })
      // getOperatorPublicationAuthorization
      .addCase(getOperatorPublicationAuthorization.fulfilled, (state, action) => {
        state.publicationAuthorization = action.payload;
      })
      .addCase(getOperatorPublicationAuthorization.rejected, (state) => {
        state.publicationAuthorization = null;
      })
      // getOperatorTimeline
      .addCase(getOperatorTimeline.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getOperatorTimeline.fulfilled, (state, action) => {
        state.timeline = action.payload;
        state.loading = false;
        state.error = false;
      })
      .addCase(getOperatorTimeline.rejected, (state) => {
        state.error = true;
        state.loading = false;
      })
      // getSawMillsByOperatorId
      .addCase(getSawMillsByOperatorId.pending, (state) => {
        state.sawmills.loading = true;
        state.sawmills.error = false;
      })
      .addCase(getSawMillsByOperatorId.fulfilled, (state, action) => {
        state.sawmills.data = action.payload;
        state.sawmills.loading = false;
        state.sawmills.error = false;
      })
      .addCase(getSawMillsByOperatorId.rejected, (state) => {
        state.sawmills.error = true;
        state.sawmills.loading = false;
      })
      // getSawMillsLocationByOperatorId
      .addCase(getSawMillsLocationByOperatorId.pending, (state) => {
        state.sawmillsLocations.loading = true;
        state.sawmillsLocations.error = false;
      })
      .addCase(getSawMillsLocationByOperatorId.fulfilled, (state, action) => {
        state.sawmillsLocations.data = action.payload.features;
        state.sawmillsLocations.loading = false;
        state.sawmillsLocations.error = false;
      })
      .addCase(getSawMillsLocationByOperatorId.rejected, (state) => {
        state.sawmillsLocations.error = true;
        state.sawmillsLocations.loading = false;
      });
  },
});

export const { setOperatorDocumentationDate, setOperatorDocumentationFMU } = operatorsDetailSlice.actions;

export default operatorsDetailSlice.reducer;
