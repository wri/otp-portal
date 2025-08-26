import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from 'services/api';

// Utils
import { encode, decode, parseObjectSelectOptions, isEmpty } from 'utils/general';
import { setUrlParam } from 'utils/url';
import { addApiCases, createApiThunk } from 'utils/redux-helpers';

const OBS_MAX_SIZE = 3000;
const FRONTEND_FILTERS = {
  hidden: [{ id: 'all', name: 'all' }]
}

export const getObservations = createAsyncThunk(
  'observations/getObservations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { language, observations } = getState();
      const filters = observations.filters.data;
      const metadata = {
        timestamp: new Date()
      };
      const includes = [
        'country',
        'subcategory',
        'subcategory.category',
        'operator',
        'severity',
        'fmu',
        'observation-report',
        'observers',
        'observation-documents',
        'relevant-operators'
      ];

      const params = {
        locale: language,
        'page[size]': OBS_MAX_SIZE,
        include: includes.join(','),
        'fields[fmus]': 'name',
        'fields[operators]': 'name,operator-type',
        'fields[severities]': 'details,level',
        'fields[subcategories]': 'name,category',
        'fields[categories]': 'name',
        'fields[countries]': 'iso,name',
        'fields[observers]': 'name,observer-type,public-info,address,information-email,information-name,information-phone,data-email,data-name,data-phone',
        'fields[observation-reports]': 'attachment,title,publication-date',
        'fields[observation-documents]': 'attachment,name',
        ...Object.keys(filters).reduce((acc, key) => {
          if (isEmpty(filters[key])) return acc;
          return {
            ...acc,
            [`filter[${key}]`]: filters[key].join(',')
          }
        }, {})
      };

      const { data } = await API.get('observations', params);
      return { data, metadata };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getFilters = createApiThunk(
  'observations/getFilters',
  'observation_filters_tree',
  {
    requestOptions: { deserialize: false },
    transformResponse: (data) => parseObjectSelectOptions({ ...data, ...FRONTEND_FILTERS })
  }
);

function isLatestAction(state, action) {
  return action.payload?.metadata?.timestamp >= state.timestamp;
}

const observationsSlice = createSlice({
  name: 'observations',
  initialState: {
    data: [],
    timestamp: null,
    loading: false,
    error: false,
    map: {
      zoom: 5,
      latitude: -1.45,
      longitude: 15
    },
    cluster: {},
    filters: {
      data: {},
      options: {},
      loading: false,
      error: false
    },
    columns: ['status', 'date', 'country', 'operator', 'category', 'observation', 'level', 'fmu', 'report']
  },
  reducers: {
    setFiltersObservations: (state, action) => {
      state.filters.data = action.payload;
    },
    setActiveColumnsObservations: (state, action) => {
      state.columns = action.payload;
    },
    setObservationsMapLocation: (state, action) => {
      state.map = action.payload;
    },
    setObservationsMapCluster: (state, action) => {
      state.cluster = action.payload;
    },
  },
  extraReducers: (builder) => {
    addApiCases(getFilters, 'filters', 'options')(builder);

    builder
      .addCase(getObservations.pending, (state, action) => {
        state.loading = true;
        state.error = false;
        state.timestamp = action.payload?.metadata?.timestamp || Date.now();
      })
      .addCase(getObservations.fulfilled, (state, action) => {
        if (!isLatestAction(state, action)) return;
        state.data = action.payload.data;
        state.loading = false;
        state.error = false;
      })
      .addCase(getObservations.rejected, (state, action) => {
        if (!isLatestAction(state, action)) return;
        state.error = true;
        state.loading = false;
      })
  },
});

export const { setFiltersObservations, setActiveColumnsObservations, setObservationsMapLocation, setObservationsMapCluster } = observationsSlice.actions;

export function setActiveColumns(activeColumns) {
  return (dispatch) => {
    dispatch(setActiveColumnsObservations(activeColumns));
  };
}

function setUrlFilters(filters) {
  const queryFiltersObj = {};

  Object.keys(filters).forEach((key) => {
    if (filters[key] && filters[key].length) queryFiltersObj[key] = filters[key];
  });

  setUrlParam('filters', Object.keys(queryFiltersObj).length ? encode(queryFiltersObj) : null);
}

export function setFilters(filter) {
  return (dispatch, getState) => {
    const newFilters = { ...getState().observations.filters.data };
    Object.keys(filter).forEach((key) => {
      newFilters[key] = filter[key];
    });

    dispatch(setFiltersObservations(newFilters));
    setUrlFilters(newFilters);
  };
}

export function getObservationsUrl(url) {
  return (dispatch) => {
    const filters = url.query.filters;
    let payload = {};
    if (filters) {
      payload = {
        ...decode(url.query.filters),
      };
    }
    dispatch(setFiltersObservations(payload));
  };
}

export default observationsSlice.reducer;
