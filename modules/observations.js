import normalize from 'json-api-normalizer';
import fetch from 'isomorphic-fetch';

/* Constants */
const GET_OBSERVATORS_SUCCESS = 'GET_OBSERVATORS_SUCCESS';
const GET_OBSERVATORS_ERROR = 'GET_OBSERVATORS_ERROR';
const GET_OBSERVATORS_LOADING = 'GET_OBSERVATORS_LOADING';

/* Initial state */
const initialState = {
  data: {},
  loading: false,
  error: false
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_OBSERVATORS_SUCCESS:
      return Object.assign({}, state, { data: action.payload.data, loading: false, error: false });
    case GET_OBSERVATORS_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_OBSERVATORS_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    default:
      return state;
  }
}

/* Action creators */
export function getObservations() {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OBSERVATORS_LOADING });


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
          type: GET_OBSERVATORS_SUCCESS,
          payload: {
            data: normalize(observations)
          }
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OBSERVATORS_ERROR,
          payload: err.message
        });
      });
  };
}
