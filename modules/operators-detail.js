import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import API from 'services/api';
import { parseDocument } from 'utils/documents';
import { addApiCases, createApiThunk } from 'utils/redux-helpers';

export const getOperatorBySlug = createApiThunk(
  'operatorsDetail/getOperatorBySlug',
  'operators',
  {
    useUserToken: true,
    params: ({ slug, loadFMUS = false }) => ({
      include: ['country', 'fmus', 'observations'].join(','),
      'fields[countries]': 'name,id,iso',
      'fields[observations]': 'id,hidden',
      ...(loadFMUS ? {} : { 'fields[fmus]': 'name,id' }),
      'filter[slug]': slug
    }),
    transformResponse: (data, { slug, loadFMUS = false }) => {
      const operator = data[0];
      if (!operator) throw new Error('Operator not found');
      operator.loadedFMUS = loadFMUS;
      return operator;
    }
  }
);

export const getOperator = createApiThunk(
  'operatorsDetail/getOperator',
  (id) => `operators/${id}`,
  {
    useUserToken: true,
    params: {
      include: ['country', 'fmus'].join(',')
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

export const getOperatorPublicationAuthorization = createApiThunk(
  'operatorsDetail/getOperatorPublicationAuthorization',
  'operator-documents',
  {
    useUserToken: true,
    params: (id) => ({
      include: [
        'required-operator-document',
        'required-operator-document.required-operator-document-group',
      ].join(','),
      'filter[operator-id]': id,
      'filter[contract-signature]': true,
    }),
    transformResponse: (data) => {
      const doc = data.find((doc) => doc['required-operator-document']['contract-signature']);
      return parseDocument(doc);
    }
  }
);

export const getOperatorTimeline = createApiThunk(
  'operatorsDetail/getOperatorTimeline',
  'score-operator-documents',
  {
    useUserToken: true,
    params: (id) => ({
      'filter[operator]': id
    })
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
    timeline: []
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
    addApiCases(getOperator)(builder);
    addApiCases(getOperatorBySlug)(builder);
    builder
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
  },
});

export const { setOperatorDocumentationDate, setOperatorDocumentationFMU } = operatorsDetailSlice.actions;

export default operatorsDetailSlice.reducer;
