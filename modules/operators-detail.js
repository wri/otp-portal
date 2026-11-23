import { createSlice } from '@reduxjs/toolkit';

import {
  fetchOperatorBySlug,
  fetchOperator,
  fetchOperatorDocumentation,
  fetchOperatorObservations,
  fetchOperatorPublicationAuthorization,
  fetchOperatorTimeline
} from 'services/operators';
import { getTodayDate } from 'utils/documentation';
import { addApiCases, createApiInitialState, createServiceThunk, createNestedApiInitialState } from 'utils/redux-helpers';
import { registerReducer } from 'modules/registry';

// The slice keeps its own copy, so these always refetch (reloadOperatorDocumentation relies on it)
const NO_CACHE = { cache: false };

export const getOperatorBySlug = createServiceThunk(
  'operatorsDetail/getOperatorBySlug',
  ({ slug, loadFmus = false }, { language }) => fetchOperatorBySlug(slug, { locale: language, loadFmus, ...NO_CACHE })
    .then((data) => ({ data }))
);

export const getOperator = createServiceThunk(
  'operatorsDetail/getOperator',
  (id, { language }) => fetchOperator(id, { locale: language }).then((data) => ({ data }))
);

export const getOperatorDocumentation = createServiceThunk(
  'operatorsDetail/getOperatorDocumentation',
  (operatorId, { language, operatorsDetail }) => fetchOperatorDocumentation(
    operatorId,
    operatorsDetail.date || getTodayDate(),
    { locale: language, ...NO_CACHE }
  ).then((data) => ({ data, operatorId }))
);

export const getOperatorObservations = createServiceThunk(
  'operatorsDetail/getOperatorObservations',
  (operatorId, { language }) => fetchOperatorObservations(operatorId, { locale: language, ...NO_CACHE })
    .then((data) => ({ data, operatorId }))
);

export const getOperatorPublicationAuthorization = createServiceThunk(
  'operatorsDetail/getOperatorPublicationAuthorization',
  (id, { language }) => fetchOperatorPublicationAuthorization(id, { locale: language, ...NO_CACHE })
    .then((data) => ({ data }))
);

export const getOperatorTimeline = createServiceThunk(
  'operatorsDetail/getOperatorTimeline',
  (id, { language }) => fetchOperatorTimeline(id, { locale: language, ...NO_CACHE }).then((data) => ({ data }))
);

const operatorsDetailSlice = createSlice({
  name: 'operatorsDetail',
  initialState: {
    ...createApiInitialState({}),
    ...createNestedApiInitialState(['observations', 'documentation', 'timeline']),
    publicationAuthorization: null,
    date: null,
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

// After a document change: the operator's completeness, its documents and the timeline all move
export const reloadOperatorDocumentation = (id, { publicationAuthorization = false } = {}) => (dispatch) => {
  dispatch(getOperator(id));
  dispatch(getOperatorDocumentation(id));
  dispatch(getOperatorTimeline(id));
  if (publicationAuthorization) dispatch(getOperatorPublicationAuthorization(id));
};

registerReducer('operatorsDetail', operatorsDetailSlice.reducer);

export default operatorsDetailSlice.reducer;
