import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import * as Cookies from 'js-cookie';

/* Constants */
const GET_COUNTRIES_SUCCESS = 'GET_COUNTRIES_SUCCESS';
const GET_COUNTRIES_ERROR = 'GET_COUNTRIES_ERROR';
const GET_COUNTRIES_LOADING = 'GET_COUNTRIES_LOADING';

const JSONA = new Jsona();

/* Initial state */
const initialState = {
  data: [],
  loading: false,
  error: false,
  map: {
    activeLayers: ['loss', 'gain', 'forest_concession', 'protected_areas', 'COG', 'COD', 'CMR', 'CAF', 'GAB']
  }
};

/* Reducer */
export default function (state = initialState, action) {
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
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_COUNTRIES_LOADING });

    const language = Cookies.get('language') === 'zh' ? 'zh-CN' : Cookies.get('language');

    return fetch(`${process.env.OTP_API}/countries?locale=${language}&page[size]=2000&sort=name`, {
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
      .then((countries) => {
        const dataParsed = JSONA.deserialize(countries);

        console.log(dataParsed);

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
