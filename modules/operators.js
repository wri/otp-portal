import normalize from 'json-api-normalizer';
import fetch from 'isomorphic-fetch';

/* Constants */
const GET_OPERATORS_SUCCESS = 'GET_OPERATORS_SUCCESS';
const GET_OPERATORS_ERROR = 'GET_OPERATORS_ERROR';
const GET_OPERATORS_LOADING = 'GET_OPERATORS_LOADING';

/* Initial state */
const initialState = {
  data: {},
  loading: false,
  error: false
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
    default:
      return state;
  }
}

/* Action creators */
export function getOperators() {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATORS_LOADING });


    fetch(`${process.env.OTP_API}/operators`, {
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
