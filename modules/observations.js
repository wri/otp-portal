import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import Router from 'next/router';
import isEmpty from 'lodash/isEmpty';
import compact from 'lodash/compact';

import API from 'services/api';

// Utils
import { encode, decode, parseObjectSelectOptions } from 'utils/general';

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
    data: {
      observation_type: [],
      country_id: [],
      fmu_id: [],
      years: [],
      observer_id: [],
      category_id: [],
      subcategory_id: [],
      severity_level: [],
      validation_status: [],
      hidden: []
    },
    options: {},
    loading: false,
    error: false
  },
  columns: ['status', 'date', 'country', 'operator', 'category', 'observation', 'level', 'fmu', 'report']
};

const JSONA = new Jsona();

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
      'fields[operator]': 'name',
      ...Object.keys(filters).reduce((acc, key) => {
        if (isEmpty(filters[key])) return acc;
        return {
          ...acc,
          [`filter[${key}]`]: filters[key].join(',')
        }
      }, {})
    })
      .then((observations) => {
        const dataParsed = JSONA.deserialize(observations);

        dispatch({
          type: GET_OBSERVATIONS_SUCCESS,
          payload: dataParsed,
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

    const lang = language === 'zh' ? 'zh-CN' : language;

    return fetch(`${process.env.OTP_API}/observation_filters_tree?locale=${lang}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((filters) => {
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

export function setFilters(filter) {
  return (dispatch, state) => {
    const newFilters = Object.assign({}, state().observations.filters.data);
    const key = Object.keys(filter)[0];
    newFilters[key] = filter[key];

    dispatch({
      type: SET_FILTERS_OBSERVATIONS,
      payload: newFilters
    });
  };
}

export function setObservationsUrl() {
  return (dispatch, getState) => {
    const filters = getState().observations.filters.data;
    const query = {};

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].length) query[key] = filters[key];
    });

    const location = {
      pathname: '/observations',
      query: {}
    };

    if (Object.keys(query).length) location.query.filters = encode(query);

    Router.replace(location);
  };
}

export function getObservationsUrl(url) {
  return (dispatch) => {
    const filters = url.query.filters;
    if (filters) {
      const payload = {
        ...decode(url.query.filters)
      };

      dispatch({
        type: SET_FILTERS_OBSERVATIONS,
        payload
      });
    }
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
