import Router from 'next/router';
import normalize from 'json-api-normalizer';
import fetch from 'isomorphic-fetch';

/* Constants */
const GET_OPERATORS_SUCCESS = 'GET_OPERATORS_SUCCESS';
const GET_OPERATORS_ERROR = 'GET_OPERATORS_ERROR';
const GET_OPERATORS_LOADING = 'GET_OPERATORS_LOADING';

const SET_OPERATORS_MAP_LOCATION = 'SET_OPERATORS_MAP_LOCATION';


/* Initial state */
const initialState = {
  data: {},
  loading: false,
  error: false,
  map: {
    zoom: 5,
    center: {
      lat: 0,
      lng: 18
    }
  }
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_OPERATORS_SUCCESS:
      return Object.assign({}, state, { data: action.payload.data, loading: false, error: false });
    case GET_OPERATORS_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_OPERATORS_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    case SET_OPERATORS_MAP_LOCATION:
      return Object.assign({}, state, { map: action.payload });
    default:
      return state;
  }
}

/* Action creators */
export function setOperatorsMapLocation(mapLocation) {
  return {
    type: SET_OPERATORS_MAP_LOCATION,
    payload: mapLocation
  };
}

export function getOperators() {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATORS_LOADING });


    fetch(`${process.env.OTP_API}/operators?page[size]=99999`, {
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
      .then((operators) => {
        // Fetch from server ok -> Dispatch operators
        dispatch({
          type: GET_OPERATORS_SUCCESS,
          payload: {
            data: normalize(operators)
          }
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OPERATORS_ERROR,
          payload: err.message
        });
      });
  };
}

export function setOperatorsUrl() {
  return (dispatch, getState) => {
    const { operators } = getState();

    const location = {
      pathname: '/operators',
      query: {
        lat: operators.map.center.lat.toFixed(2),
        lng: operators.map.center.lng.toFixed(2),
        zoom: operators.map.zoom.toFixed(2)
      }
    };

    Router.replace(location);
  };
}

export function getOperatorsUrl(url) {
  const { zoom, lat, lng } = url.query;

  return {
    zoom: +zoom || initialState.map.zoom,
    center: {
      lat: +lat || initialState.map.center.lat,
      lng: +lng || initialState.map.center.lng
    }
  };
}
