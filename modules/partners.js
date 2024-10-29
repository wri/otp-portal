import Jsona from 'jsona';

import API from 'services/api';

/* Constants */
const GET_PARTNERS_SUCCESS = 'GET_PARTNERS_SUCCESS';
const GET_PARTNERS_ERROR = 'GET_PARTNERS_ERROR';
const GET_PARTNERS_LOADING = 'GET_PARTNERS_LOADING';

const JSONA = new Jsona();

/* Initial state */
const initialState = {
  data: [],
  loading: false,
  error: false
};

/* Reducer */
export default function Partners(state = initialState, action) {
  switch (action.type) {
    case GET_PARTNERS_SUCCESS:
      return Object.assign({}, state, {
        data: action.payload,
        loading: false,
        error: false,
      });
    case GET_PARTNERS_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_PARTNERS_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    default:
      return state;
  }
}

export function getPartners() {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_PARTNERS_LOADING });

    return API.get('partners', { 'page[size]': 2000 })
      .then((partners) => {
        const dataParsed = JSONA.deserialize(partners);

        dispatch({
          type: GET_PARTNERS_SUCCESS,
          payload: dataParsed,
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_PARTNERS_ERROR,
          payload: err.message,
        });
      });
  };
}
