import Jsona from 'jsona';

import API from 'services/api';

/* Constants */
const GET_COUNTRIES_SUCCESS = 'GET_COUNTRIES_SUCCESS';
const GET_COUNTRIES_ERROR = 'GET_COUNTRIES_ERROR';
const GET_COUNTRIES_LOADING = 'GET_COUNTRIES_LOADING';

const JSONA = new Jsona();

/* Initial state */
const initialState = {
  data: [],
  loading: false,
  error: false
};

/* Reducer */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_COUNTRIES_SUCCESS:
      return Object.assign({}, state, { data: action.payload, loading: false, error: false });
    case GET_COUNTRIES_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_COUNTRIES_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    default:
      return state;
  }
}

export function getCountries() {
  return (dispatch, getState) => {
    const { language } = getState();

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_COUNTRIES_LOADING });
    const params = {
      locale: language,
      include: 'required-gov-documents',
      'fields[required-gov-documents]': 'id',
      'page[size]': 2000,
      sort: 'name'
    };

    return API.get('countries', params)
      .then((countries) => {
        const dataParsed = JSONA.deserialize(countries);

        dispatch({
          type: GET_COUNTRIES_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_COUNTRIES_ERROR,
          payload: err.message
        });
      });
  };
}
