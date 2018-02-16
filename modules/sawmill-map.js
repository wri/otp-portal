import fetch from 'isomorphic-fetch';

const SAWMILL_UNMOUNT_MAP = 'SAWMILL_UNMOUNT_MAP';
const SAWMILL_SET_MARKER_MODE = 'SAWMILL_SET_MARKER_MODE';
const SAWMILL_SET_MARKER_LOCATION = 'SAWMILL_SET_MARKER_LOCATION';
const GET_SAWMILL_LOCATION_SUCCESS = 'GET_SAWMILL_LOCATION_SUCCESS';
const GET_SAWMILL_LOCATION_LOADING = 'GET_SAWMILL_LOCATION_LOADING';
const GET_SAWMILL_LOCATION_ERROR = 'GET_SAWMILL_LOCATION_ERROR';

const initialState = {
  mapOptions: { // TODO : transfer zoom and center
    zoom: 5,
    center: {
      lat: 0,
      lng: 18
    }
  },
  loading: false,
  error: false,
  markerMode: false,
  lngLat: {},
  sawmillStartGeojson: {}
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {

    case SAWMILL_UNMOUNT_MAP: {
      return Object.assign({}, state, { ...initialState });
    }

    case SAWMILL_SET_MARKER_MODE: {
      return Object.assign({}, state, { markerMode: action.payload });
    }

    case SAWMILL_SET_MARKER_LOCATION: {
      // const mapOptions = Object.assign({}, state.mapOptions, {
      //   center: action.payload
      // }); // TODO CENTER

      return Object.assign({}, state, { lngLat: action.payload });
    }

    case GET_SAWMILL_LOCATION_SUCCESS: {
      return Object.assign({}, state, {
        sawmillStartGeojson: action.payload,
        loading: false,
        error: false
      });
    }

    case GET_SAWMILL_LOCATION_LOADING: {
      return Object.assign({}, state, {
        loading: true,
        error: false
      });
    }

    case GET_SAWMILL_LOCATION_ERROR: {
      return Object.assign({}, state, {
        error: true,
        loading: false
      });
    }

    default:
      return state;
  }
}

export function getSawMillLocationById(id) {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_SAWMILL_LOCATION_LOADING });

    fetch(`${process.env.OTP_API}/sawmills/${id}?format=geojson`, {
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
      .then((data) => {
        // Fetch from server ok -> Dispatch geojson sawmill data
        dispatch({
          type: GET_SAWMILL_LOCATION_SUCCESS,
          payload: data
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_SAWMILL_LOCATION_ERROR,
          payload: err.message
        });
      });
  };
}


export function setMarkerMode(mode) {
  return (dispatch) => {
    dispatch({
      type: SAWMILL_SET_MARKER_MODE,
      payload: mode
    });
  };
}


export function setMarkerLocation(lngLat) {
  return (dispatch) => {
    dispatch({
      type: SAWMILL_SET_MARKER_LOCATION,
      payload: lngLat
    });
  };
}

export function unmountMap() {
  return (dispatch) => {
    dispatch({
      type: SAWMILL_UNMOUNT_MAP
    });
  };
}
