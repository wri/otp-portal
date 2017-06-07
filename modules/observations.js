import normalize from 'json-api-normalizer';
import fetch from 'isomorphic-fetch';

/* Constants */
const GET_OBSERVATIONS_SUCCESS = 'GET_OBSERVATIONS_SUCCESS';
const GET_OBSERVATIONS_ERROR = 'GET_OBSERVATIONS_ERROR';
const GET_OBSERVATIONS_LOADING = 'GET_OBSERVATIONS_LOADING';

const GET_FILTERS_SUCCESS = 'GET_FILTERS_SUCCESS';
const GET_FILTERS_ERROR = 'GET_FILTERS_ERROR';
const GET_FILTERS_LOADING = 'GET_FILTERS_LOADING';
const SET_FILTERS = 'SET_FILTERS';

/* Initial state */
const initialState = {
  data: {},
  loading: false,
  error: false,
  filters: {
    data: {
      type: [],
      country: []
    },
    options: {},
    loading: false,
    error: false
  }
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_OBSERVATIONS_SUCCESS:
      return Object.assign({}, state, { data: action.payload.data, loading: false, error: false });
    case GET_OBSERVATIONS_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_OBSERVATIONS_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    // Filters
    case GET_FILTERS_SUCCESS: {
      const newFilters = Object.assign({}, state.filters, {
        options: action.payload.data, loading: false, error: false
      });
      return Object.assign({}, state, { filters: newFilters });
    }
    case GET_FILTERS_ERROR: {
      const newFilters = Object.assign({}, state.filters, { error: true, loading: false });
      return Object.assign({}, state, { filters: newFilters });
    }
    case GET_FILTERS_LOADING: {
      const newFilters = Object.assign({}, state.filters, { loading: true, error: false });
      return Object.assign({}, state, { filters: newFilters });
    }
    case SET_FILTERS: {
      const newFilters = Object.assign({}, state.filters, { data: action.payload });
      return Object.assign({}, state, { filters: newFilters });
    }
    default:
      return state;
  }
}

/* Action creators */
export function getObservations() {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OBSERVATIONS_LOADING });


    fetch(`${process.env.OTP_API}/observations`, {
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
      .then((observations) => {
        // Fetch from server ok -> Dispatch observations
        dispatch({
          type: GET_OBSERVATIONS_SUCCESS,
          payload: {
            data: normalize(observations)
          }
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OBSERVATIONS_ERROR,
          payload: err.message
        });
      });
  };
}

export function getFilters() {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FILTERS_LOADING });


    fetch(`${process.env.OTP_API}/filters`, {
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
          type: GET_FILTERS_SUCCESS,
          payload: {
            data: normalize(filters)
          }
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_FILTERS_ERROR,
          payload: err.message
        });
      });
  };
}

export function setFilters(filter) {
  return (dispatch, state) => {
    const newFilters = Object.assign({}, state().observations.filters.data);
    const key = Object.keys(filter)[0];
    newFilters[key] = filter[key];

    dispatch({
      type: SET_FILTERS,
      payload: newFilters
    });
  };
}
