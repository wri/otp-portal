import { createSlice } from '@reduxjs/toolkit';

// Utils
import { encode, decode, parseObjectSelectOptions, getApiFiltersParams } from 'utils/general';
import { setUrlParam } from 'utils/url';
import { addApiCases, createApiThunk } from 'utils/redux-helpers';

const OBS_MAX_SIZE = 3000;
const FRONTEND_FILTERS = {
  hidden: [{ id: 'all', name: 'all' }]
}

export const getObservations = createApiThunk(
  'observations/getObservations',
  'observations',
  {
    params: (_arg, { observations }) => {
      const filters = observations.filters.data;
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

      return {
        'page[size]': OBS_MAX_SIZE,
        include: includes.join(','),
        'fields[fmus]': 'name',
        'fields[operators]': 'name,operator-type',
        'fields[severities]': 'details,level',
        'fields[subcategories]': 'name,category',
        'fields[categories]': 'name',
        'fields[countries]': 'iso,name',
        'fields[observers]': 'name,observer-type,public-info,address,information-email,information-name,information-phone,data-email,data-name,data-phone',
        'fields[observation-reports]': 'attachment,title,publication-date,mission-type',
        'fields[observation-documents]': 'attachment,name',
        ...getApiFiltersParams(filters)
      };
    }
  }
)

export const getFilters = createApiThunk(
  'observations/getFilters',
  'observation_filters_tree',
  {
    requestOptions: { deserialize: false },
    transformResponse: (data) => ({ options: parseObjectSelectOptions({ ...data, ...FRONTEND_FILTERS }) })
  }
);

const observationsSlice = createSlice({
  name: 'observations',
  initialState: {
    data: [],
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
    addApiCases(getFilters, 'filters')(builder);
    addApiCases(getObservations)(builder);
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
