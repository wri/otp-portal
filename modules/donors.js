import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';

/* Constants */
const GET_DONORS_SUCCESS = 'GET_DONORS_SUCCESS';
const GET_DONORS_ERROR = 'GET_DONORS_ERROR';
const GET_DONORS_LOADING = 'GET_DONORS_LOADING';

const JSONA = new Jsona();

/* Initial state */
const initialState = {
  data: [],
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
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_DONORS_SUCCESS:
      return Object.assign({}, state, { data: action.payload, loading: false, error: false });
    case GET_DONORS_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_DONORS_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    default:
      return state;
  }
}

export function getDonors() {
  return (dispatch, getState) => {
    const { language } = getState();

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_DONORS_LOADING });

    const lang = language === 'zh' ? 'zh-CN' : language;

    return fetch(`${process.env.OTP_API}/donors?locale=${lang}&page[size]=2000`, {
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
      .then((donors) => {
        const dataParsed = JSONA.deserialize(donors);

        dispatch({
          type: GET_DONORS_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_DONORS_ERROR,
          payload: err.message
        });
      });
  };
}
