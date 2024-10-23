import Jsona from 'jsona';

import API from 'services/api';

/* Constants */
const GET_COUNTRY_SUCCESS = 'GET_COUNTRY_SUCCESS';
const GET_COUNTRY_ERROR = 'GET_COUNTRY_ERROR';
const GET_COUNTRY_LOADING = 'GET_COUNTRY_LOADING';

const GET_COUNTRY_LINKS_SUCCESS = 'GET_COUNTRY_LINKS_SUCCESS';
const GET_COUNTRY_LINKS_ERROR = 'GET_COUNTRY_LINKS_ERROR';
const GET_COUNTRY_LINKS_LOADING = 'GET_COUNTRY_LINKS_LOADING';

const GET_COUNTRY_VPAS_SUCCESS = 'GET_COUNTRY_VPAS_SUCCESS';
const GET_COUNTRY_VPAS_ERROR = 'GET_COUNTRY_VPAS_ERROR';
const GET_COUNTRY_VPAS_LOADING = 'GET_COUNTRY_VPAS_LOADING';

/* Initial state */
const initialState = {
  data: {},
  loading: false,
  error: false,
  documentation: {
    data: {},
    loading: false,
    error: false
  },
  links: {
    data: [],
    loading: false,
    error: false
  },
  vpas: {
    data: [],
    loading: false,
    error: false
  }
};

const JSONA = new Jsona();

/* Reducer */
export default function reducer(state = initialState, action) {
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
    case GET_COUNTRY_LINKS_SUCCESS: {
      const links = Object.assign({}, state.links, {
        data: action.payload, loading: false, error: false
      });
      return Object.assign({}, state, { links });
    }
    case GET_COUNTRY_LINKS_ERROR: {
      const links = Object.assign({}, state.links, { error: true, loading: false });
      return Object.assign({}, state, { links });
    }
    case GET_COUNTRY_LINKS_LOADING: {
      const links = Object.assign({}, state.links, { loading: true, error: false });
      return Object.assign({}, state, { links });
    }

    case GET_COUNTRY_VPAS_SUCCESS: {
      const vpas = Object.assign({}, state.vpas, {
        data: action.payload, loading: false, error: false
      });
      return Object.assign({}, state, { vpas });
    }
    case GET_COUNTRY_VPAS_ERROR: {
      const vpas = Object.assign({}, state.vpas, { error: true, loading: false });
      return Object.assign({}, state, { vpas });
    }
    case GET_COUNTRY_VPAS_LOADING: {
      const vpas = Object.assign({}, state.vpas, { loading: true, error: false });
      return Object.assign({}, state, { vpas });
    }

    default:
      return state;
  }
}

/* Action creators */
export function getCountry(id) {
  return (dispatch, getState) => {
    const { user, language } = getState();

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_COUNTRY_LOADING });

    const includeFields = [
      'governments',
      'required-gov-documents',
      'required-gov-documents.required-gov-document-group',
      'required-gov-documents.required-gov-document-group.parent',
      'required-gov-documents.gov-documents'
    ];

    const queryParams = {
      ...(!!includeFields.length && { include: includeFields.join(',') }),
      locale: language
    };

    return API.get(`countries/${id}`, queryParams, { token: user.token })
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

export function getCountryLinks(id) {
  return (dispatch, getState) => {
    const { user, language } = getState();

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_COUNTRY_LINKS_LOADING });

    const queryParams = {
      country: id,
      locale: language
    };

    return API.get('country-links', queryParams, { token: user.token })
      .then((links) => {
        // Fetch from server ok -> Dispatch country and deserialize the data
        const dataParsed = JSONA.deserialize(links);

        dispatch({
          type: GET_COUNTRY_LINKS_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_COUNTRY_LINKS_ERROR,
          payload: err.message
        });
      });
  };
}

export function getCountryVPAs(id) {
  return (dispatch, getState) => {
    const { user, language } = getState();

    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_COUNTRY_VPAS_LOADING });

    const queryParams = {
      country: id,
      locale: language
    };

    return API.get('country-vpas', queryParams, { token: user.token })
      .then((links) => {
        // Fetch from server ok -> Dispatch country and deserialize the data
        const dataParsed = JSONA.deserialize(links);

        dispatch({
          type: GET_COUNTRY_VPAS_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_COUNTRY_VPAS_ERROR,
          payload: err.message
        });
      });
  };
}
