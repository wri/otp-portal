import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import * as queryString from 'query-string';
import * as Cookies from 'js-cookie';

/* Constants */
const GET_COUNTRY_SUCCESS = 'GET_COUNTRY_SUCCESS';
const GET_COUNTRY_ERROR = 'GET_COUNTRY_ERROR';
const GET_COUNTRY_LOADING = 'GET_COUNTRY_LOADING';

/* Constants */
const GET_COUNTRY_DOCUMENTS_SUCCESS = 'GET_COUNTRY_DOCUMENTS_SUCCESS';
const GET_COUNTRY_DOCUMENTS_ERROR = 'GET_COUNTRY_DOCUMENTS_ERROR';
const GET_COUNTRY_DOCUMENTS_LOADING = 'GET_COUNTRY_DOCUMENTS_LOADING';

/* Initial state */
const initialState = {
  data: {},
  loading: false,
  error: false,
  documentation: {
    data: {},
    loading: false,
    error: false
  }
};

const JSONA = new Jsona();

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_COUNTRY_SUCCESS: {
      return Object.assign({}, state, { data: action.payload, loading: false, error: false });
    }
    case GET_COUNTRY_ERROR: {
      return Object.assign({}, state, { error: true, loading: false });
    }
    case GET_COUNTRY_LOADING: {
      return Object.assign({}, state, { loading: true, error: false });
    }
    case GET_COUNTRY_DOCUMENTS_SUCCESS: {
      const documentation = Object.assign({}, state.documentation, {
        data: action.payload, loading: false, error: false
      });
      return Object.assign({}, state, { documentation });
    }
    case GET_COUNTRY_DOCUMENTS_ERROR: {
      const documentation = Object.assign({}, state.documentation, { error: true, loading: false });
      return Object.assign({}, state, { documentation });
    }
    case GET_COUNTRY_DOCUMENTS_LOADING: {
      const documentation = Object.assign({}, state.documentation, { loading: true, error: false });
      return Object.assign({}, state, { documentation });
    }

    default:
      return state;
  }
}

/* Action creators */
export function getCountry(id) {
  return (dispatch, getState) => {
    const { user } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_COUNTRY_LOADING });

    const includeFields = [
      'governments',
      'required-gov-documents',
      'required-gov-documents.required-gov-document-group',
      'required-gov-documents.gov-documents',
      'required-gov-documents.gov-documents.gov-files'
    ];

    const language = Cookies.get('language') === 'zh' ? 'zh-CN' : Cookies.get('language');

    const queryParams = queryString.stringify({
      ...!!includeFields.length && { include: includeFields.join(',') },
      locale: language
    });


    fetch(`${process.env.OTP_API}/countries/${id}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'OTP-API-KEY': process.env.OTP_API_KEY,
        Authorization: user.token ? `Bearer ${user.token}` : undefined
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((country) => {
        // Fetch from server ok -> Dispatch country and deserialize the data
        const dataParsed = JSONA.deserialize(country);

        dispatch({
          type: GET_COUNTRY_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_COUNTRY_ERROR,
          payload: err.message
        });
      });
  };
}