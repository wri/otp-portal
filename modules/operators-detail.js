import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import * as queryString from 'query-string';

/* Constants */
const GET_OPERATOR_SUCCESS = 'GET_OPERATOR_SUCCESS';
const GET_OPERATOR_ERROR = 'GET_OPERATOR_ERROR';
const GET_OPERATOR_LOADING = 'GET_OPERATOR_LOADING';


/* Initial state */
const initialState = {
  data: {},
  loading: false,
  error: false
};

const JSONA = new Jsona();

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_OPERATOR_SUCCESS:
      return Object.assign({}, state, { data: action.payload, loading: false, error: false });
    case GET_OPERATOR_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_OPERATOR_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    default:
      return state;
  }
}

/* Action creators */
export function getOperator(id) {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATOR_LOADING });

    const includeFields = [
      'observations',
      'observations.severity',
      'observations.subcategory',
      'observations.documents',
      'observations.subcategory.category',
      'fmus',
      'operator-document-fmus.required-operator-document-fmu.required-operator-document-group',
      'operator-document-fmus.fmu',
      'operator-document-countries.required-operator-document-country.required-operator-document-group'
    ];

    const queryParams = queryString.stringify({
      include: includeFields.join(',')
    });


    fetch(`${process.env.OTP_API}/operators/${id}?${queryParams}`, {
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
      .then((operator) => {
        // Fetch from server ok -> Dispatch operator and deserialize the data
        const dataParsed = JSONA.deserialize(operator);

        dispatch({
          type: GET_OPERATOR_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OPERATOR_ERROR,
          payload: err.message
        });
      });
  };
}
