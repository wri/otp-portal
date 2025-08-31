import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import { parseDocument } from 'utils/documents';
import { addApiCases, createApiInitialState, createApiThunk, createNestedApiInitialState } from 'utils/redux-helpers';

export const getOperatorBySlug = createApiThunk(
  'operatorsDetail/getOperatorBySlug',
  'operators',
  {
    useUserToken: true,
    params: ({ slug, loadFmus = false }) => ({
      include: ['country', 'fmus', 'observations'].join(','),
      'fields[countries]': 'name,id,iso',
      'fields[observations]': 'id,hidden',
      ...(loadFmus ? {} : { 'fields[fmus]': 'name,id' }),
      'filter[slug]': slug
    }),
    transformResponse: (data, _response, { loadFmus = false }) => {
      const operator = data[0];
      if (!operator) throw new Error('Operator not found');
      operator.loadedFMUS = loadFmus;
      return { data: operator };
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

export const getOperatorDocumentation = createApiThunk(
  'operatorsDetail/getOperatorDocumentation',
  'operator-document-histories',
  {
    useUserToken: true,
    params: (operatorId, { operatorsDetail }) => {
      const { date } = operatorsDetail;
      const includeFields = [
        'required-operator-document',
        'required-operator-document.required-operator-document-group',
        'operator-document-annexes',
        'fmu',
      ];

      return {
        include: includeFields.join(','),
        'fields[fmus]': 'name',
        'filter[operator-id]': operatorId,
        'filter[date]': date,
      }
    },
    transformResponse: (data, _response, operatorId) => {
      return { data, operatorId };
    }
  }
)

export const getOperatorObservations = createApiThunk(
  'operatorsDetail/getOperatorObservations',
  'observations',
  {
    params: (operatorId) => {
      const includes = [
        'country', 'fmu', 'observers', 'severity', 'subcategory',
        'subcategory.category', 'observation-report', 'observation-documents',
        'relevant-operators', 'operator',
      ];

      return {
        include: includes.join(','),
        'fields[fmus]': 'name',
        'filter[operator]': operatorId,
        'filter[hidden]': 'all'
      }
    },
    transformResponse: (data, _response, operatorId) => {
      return { data, operatorId };
    }
  }
)

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
      return { data: parseDocument(doc) };
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

const operatorsDetailSlice = createSlice({
  name: 'operatorsDetail',
  initialState: {
    ...createApiInitialState({}),
    ...createNestedApiInitialState(['observations', 'documentation', 'timeline']),
    publicationAuthorization: null,
    date: dayjs().format('YYYY-MM-DD'),
    fmu: null
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
    addApiCases(getOperatorTimeline, 'timeline')(builder);
    addApiCases(getOperatorDocumentation, 'documentation')(builder)
    addApiCases(getOperatorObservations, 'observations')(builder)

    builder
      // getOperatorPublicationAuthorization
      .addCase(getOperatorPublicationAuthorization.fulfilled, (state, action) => {
        state.publicationAuthorization = action.payload.data;
      })
      .addCase(getOperatorPublicationAuthorization.rejected, (state) => {
        state.publicationAuthorization = null;
      })
  },
});

export const { setOperatorDocumentationDate, setOperatorDocumentationFMU } = operatorsDetailSlice.actions;

export default operatorsDetailSlice.reducer;
