import isEmpty from 'lodash/isEmpty';

import API from 'services/api';

// Utils
import { encode, decode, parseObjectSelectOptions } from 'utils/general';
import { setUrlParam } from 'utils/url';

/* Constants */
const GET_OBSERVATIONS_SUCCESS = 'GET_OBSERVATIONS_SUCCESS';
const GET_OBSERVATIONS_ERROR = 'GET_OBSERVATIONS_ERROR';
const GET_OBSERVATIONS_LOADING = 'GET_OBSERVATIONS_LOADING';

const GET_FILTERS_OBSERVATIONS_SUCCESS = 'GET_FILTERS_OBSERVATIONS_SUCCESS';
const GET_FILTERS_OBSERVATIONS_ERROR = 'GET_FILTERS_OBSERVATIONS_ERROR';
const GET_FILTERS_OBSERVATIONS_LOADING = 'GET_FILTERS_OBSERVATIONS_LOADING';
const SET_FILTERS_OBSERVATIONS = 'SET_FILTERS_OBSERVATIONS';
const SET_ACTIVE_COLUMNS_OBSERVATIONS = 'SET_ACTIVE_COLUMNS_OBSERVATIONS';
const SET_OBSERVATIONS_MAP_LOCATION = 'SET_OBSERVATIONS_MAP_LOCATION';
const SET_OBSERVATIONS_MAP_CLUSTER = 'SET_OBSERVATIONS_MAP_CLUSTER';

const OBS_MAX_SIZE = 3000;

/* Initial state */
const initialState = {
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
};

function isLatestAction(state, action) {
  return action.metadata.timestamp >= state.timestamp;
}

/* Reducer */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_OBSERVATIONS_SUCCESS:
      if (!isLatestAction(state, action)) return state;
      return Object.assign({}, state, {
        data: action.payload, loading: false, error: false
      });
    case GET_OBSERVATIONS_ERROR:
      if (!isLatestAction(state, action)) return state;
      return Object.assign({}, state, { error: true, loading: false });
    case GET_OBSERVATIONS_LOADING:
      return Object.assign({}, state, { loading: true, error: false, timestamp: action.metadata.timestamp });
      // Filters
    case GET_FILTERS_OBSERVATIONS_SUCCESS: {
      const newFilters = Object.assign({}, state.filters, {
        options: action.payload, loading: false, error: false
      });
      return Object.assign({}, state, { filters: newFilters });
    }
    case GET_FILTERS_OBSERVATIONS_ERROR: {
      const newFilters = Object.assign({}, state.filters, { error: true, loading: false });
      return Object.assign({}, state, { filters: newFilters });
    }
    case GET_FILTERS_OBSERVATIONS_LOADING: {
      const newFilters = Object.assign({}, state.filters, { loading: true, error: false });
      return Object.assign({}, state, { filters: newFilters });
    }
    case SET_FILTERS_OBSERVATIONS: {
      const newFilters = Object.assign({}, state.filters, { data: action.payload });
      return Object.assign({}, state, { filters: newFilters });
    }
    case SET_ACTIVE_COLUMNS_OBSERVATIONS: {
      return Object.assign({}, state, { columns: action.payload });
    }
    case SET_OBSERVATIONS_MAP_LOCATION: {
      return Object.assign({}, state, { map: action.payload });
    }
    case SET_OBSERVATIONS_MAP_CLUSTER: {
      return Object.assign({}, state, { cluster: action.payload });
    }
    default:
      return state;
  }
}

/* Action creators */
export function getObservations() {
  return (dispatch, getState) => {
    const { language } = getState();
    const filters = getState().observations.filters.data;
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

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OBSERVATIONS_LOADING, metadata });

    return API.get('observations', {
      locale: language,
      'page[size]': OBS_MAX_SIZE,
      include: includes.join(','),
      'fields[fmus]': 'name',
      'fields[operators]': 'name,operator-type',
      'fields[severities]': 'details,level',
      'fields[subcategories]': 'name,category',
      'fields[categories]': 'name',
      'fields[countries]': 'iso,name',
      'fields[observers]': 'name,observer-type',
      'fields[observation-reports]': 'attachment,title,publication-date',
      'fields[observation-documents]': 'attachment,name',
      ...Object.keys(filters).reduce((acc, key) => {
        if (isEmpty(filters[key])) return acc;
        return {
          ...acc,
          [`filter[${key}]`]: filters[key].join(',')
        }
      }, {})
    })
      .then(({ data }) => {
        dispatch({
          type: GET_OBSERVATIONS_SUCCESS,
          payload: data,
          metadata
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OBSERVATIONS_ERROR,
          payload: err.message,
          metadata
        });
      });
  };
}

export function getFilters() {
  return (dispatch, getState) => {
    const { language } = getState();

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FILTERS_OBSERVATIONS_LOADING });

    return API.get('observation_filters_tree', { locale: language }, { deserialize: false })
      .then(({ data: filters }) => {
        // Fetch from server ok -> Dispatch observations
        dispatch({
          type: GET_FILTERS_OBSERVATIONS_SUCCESS,
          payload: parseObjectSelectOptions(filters)
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_FILTERS_OBSERVATIONS_ERROR,
          payload: err.message
        });
      });
  };
}

export function setActiveColumns(activeColumns) {
  return (dispatch) => {
    dispatch({
      type: SET_ACTIVE_COLUMNS_OBSERVATIONS,
      payload: activeColumns
    });
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
  return (dispatch, state) => {
    const newFilters = Object.assign({}, state().observations.filters.data);
    Object.keys(filter).forEach((key) => {
      newFilters[key] = filter[key];
    })

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
    dispatch({
      type: SET_FILTERS_OBSERVATIONS,
      payload,
    });
  };
}

// SETTERS
export function setObservationsMapLocation(payload) {
  return {
    type: SET_OBSERVATIONS_MAP_LOCATION,
    payload
  };
}

// SETTERS
export function setObservationsMapCluster(payload) {
  return {
    type: SET_OBSERVATIONS_MAP_CLUSTER,
    payload
  };
}
