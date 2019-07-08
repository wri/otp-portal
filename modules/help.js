import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import * as Cookies from 'js-cookie';

/* Constants */
const GET_FAQS_SUCCESS = 'GET_FAQS_SUCCESS';
const GET_FAQS_ERROR = 'GET_FAQS_ERROR';
const GET_FAQS_LOADING = 'GET_FAQS_LOADING';

const GET_TUTORIALS_SUCCESS = 'GET_TUTORIALS_SUCCESS';
const GET_TUTORIALS_ERROR = 'GET_TUTORIALS_ERROR';
const GET_TUTORIALS_LOADING = 'GET_TUTORIALS_LOADING';

const JSONA = new Jsona();

/* Initial state */
const initialState = {
  faqs: {
    data: [],
    loading: false,
    error: false
  },
  tutorials: {
    data: [],
    loading: false,
    error: false
  }
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_FAQS_SUCCESS: {
      const faqs = Object.assign({}, state.faqs, {
        data: action.payload, loading: false, error: false
      });
      return Object.assign({}, state, { faqs });
    }
    case GET_FAQS_ERROR: {
      const faqs = Object.assign({}, state.faqs, {
        error: true, loading: false
      });
      return Object.assign({}, state, { faqs });
    }
    case GET_FAQS_LOADING: {
      const faqs = Object.assign({}, state.faqs, {
        loading: true, error: false
      });
      return Object.assign({}, state, { faqs });
    }
    case GET_TUTORIALS_SUCCESS: {
      const tutorials = Object.assign({}, state.tutorials, {
        data: action.payload, loading: false, error: false
      });
      return Object.assign({}, state, { tutorials });
    }
    case GET_TUTORIALS_ERROR: {
      const tutorials = Object.assign({}, state.tutorials, {
        error: true, loading: false
      });
      return Object.assign({}, state, { tutorials });
    }
    case GET_TUTORIALS_LOADING: {
      const tutorials = Object.assign({}, state.tutorials, {
        loading: true, error: false
      });
      return Object.assign({}, state, { tutorials });
    }
    default:
      return state;
  }
}

export function getFAQs() {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_FAQS_LOADING });

    const language = Cookies.get('language') === 'zh' ? 'zh-CN' : Cookies.get('language');

    fetch(`${process.env.OTP_API}/faqs?locale=${language}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((faqs) => {
        const dataParsed = JSONA.deserialize(faqs);

        dispatch({
          type: GET_FAQS_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_FAQS_ERROR,
          payload: err.message
        });
      });
  };
}


export function getTutorials() {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_TUTORIALS_LOADING });

    const language = Cookies.get('language') === 'zh' ? 'zh-CN' : Cookies.get('language');

    fetch(`${process.env.OTP_API}/tutorials?locale=${language}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((tutorials) => {
        const dataParsed = JSONA.deserialize(tutorials);

        dispatch({
          type: GET_TUTORIALS_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_TUTORIALS_ERROR,
          payload: err.message
        });
      });
  };
}