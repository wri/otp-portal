import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';
import * as queryString from 'query-string';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';

import { get, post } from 'utils/request';

// CONSTANTS
const SET_USER = 'SET_USER';
const REMOVE_USER = 'REMOVE_USER';

const GET_USER_PROFILE_SUCCESS = 'GET_USER_PROFILE_SUCCESS';
const GET_USER_PROFILE_ERROR = 'GET_USER_PROFILE_ERROR';
const GET_USER_PROFILE_LOADING = 'GET_USER_PROFILE_LOADING';
const GET_USER_OPERATOR_SUCCESS = 'GET_USER_OPERATOR_SUCCESS';
const GET_USER_OPERATOR_ERROR = 'GET_USER_OPERATOR_ERROR';
const GET_USER_OPERATOR_LOADING = 'GET_USER_OPERATOR_LOADING';

const JSONA = new Jsona();

// REDUCER
const initialState = {};

export default function User(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return Object.assign({}, state, action.payload);
    case GET_USER_PROFILE_SUCCESS: {
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          data: action.payload,
          loading: false,
          error: false,
        }
      }
    }
    case GET_USER_PROFILE_ERROR: {
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          error: true,
          loading: false,
        }
      }
    }
    case GET_USER_PROFILE_LOADING: {
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          loading: true,
          error: false,
        }
      }
    }
    case GET_USER_OPERATOR_SUCCESS: {
      return {
        ...state,
        userOperator: {
          ...state.userOperator,
          data: action.payload,
          loading: false,
          error: false,
        }
      }
    }
    case GET_USER_OPERATOR_ERROR: {
      return {
        ...state,
        userOperator: {
          ...state.userOperator,
          error: true,
          loading: false,
        }
      }
    }
    case GET_USER_OPERATOR_LOADING: {
      return {
        ...state,
        userOperator: {
          ...state.userOperator,
          loading: true,
          error: false,
        }
      }
    }
    case REMOVE_USER:
      return {};
    default:
      return state;
  }
}

// ACTIONS
export function setUser(user) {
  return { type: SET_USER, payload: user };
}

/* Action creators */
export function getUserOperator(id) {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_USER_OPERATOR_LOADING });

    const includeFields = ['country', 'fmus'];

    const queryParams = queryString.stringify({
      include: includeFields.join(','),
    });

    // Fields
    const currentFields = {
      fmus: [
        'name',
        'certification-fsc',
        'certification-olb',
        'certification-pefc',
        'certification-pafc',
        'certification-fsc-cw',
        'certification-tlv',
        'certification-ls',
      ],
    };
    const fields = Object.keys(currentFields)
      .map((f) => `fields[${f}]=${currentFields[f]}`)
      .join('&');

    return fetch(
      `${process.env.OTP_API}/operators/${id}?${queryParams}&${fields}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OTP-API-KEY': process.env.OTP_API_KEY,
        },
      }
    )
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((operator) => {
        // Fetch from server ok -> Dispatch operator and deserialize the data
        const dataParsed = JSONA.deserialize(operator);

        dispatch({
          type: GET_USER_OPERATOR_SUCCESS,
          payload: dataParsed,
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_USER_OPERATOR_ERROR,
          payload: err.message,
        });
      });
  };
}

export function login({ body }) {
  return (dispatch) =>
    new Promise((resolve, reject) => {
      post({
        url: '/login',
        type: 'POST',
        body,
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'OTP-API-KEY',
            value: process.env.OTP_API_KEY,
          },
        ],
        onSuccess: (response) => {
          window.location.reload();
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
}

export function logout() {
  return (dispatch) =>
    new Promise((resolve, reject) => {
      get({
        url: '/logout',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'OTP-API-KEY',
            value: process.env.OTP_API_KEY,
          },
        ],
        onSuccess: (response) => {
          window.location.reload();
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
}

export function getUserProfile() {
  return (dispatch, getState) => {
    const { user } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_USER_PROFILE_LOADING });

    return fetch(
      `${process.env.OTP_API}/users/${user.user_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OTP-API-KEY': process.env.OTP_API_KEY,
          Authorization: `Bearer ${user.token}`
        },
      }
    )
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((operator) => {
        // Fetch from server ok -> Dispatch operator and deserialize the data
        const dataParsed = JSONA.deserialize(operator);

        dispatch({
          type: GET_USER_PROFILE_SUCCESS,
          payload: dataParsed,
        });
      })
      .catch((err) => {
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_USER_PROFILE_ERROR,
          payload: err.message,
        });
      });
  };
}

export function saveUser({ body }) {
  return () =>
    new Promise((resolve, reject) => {
      post({
        url: `${process.env.OTP_API}/register`,
        type: 'POST',
        body,
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.api+json',
          },
          {
            key: 'OTP-API-KEY',
            value: process.env.OTP_API_KEY,
          },
        ],
        onSuccess: (response) => {
          resolve(response);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
}

export function updateUserProfile({ id, attributes, authorization }) {
  return () =>
    new Promise((resolve, reject) => {
      post({
        url: `${process.env.OTP_API}/users/${id}`,
        type: 'PATCH',
        body: {
          data: {
            id,
            type: 'users',
            attributes: omitBy(attributes, isEmpty)
          }
        },
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.api+json',
          },
          {
            key: 'OTP-API-KEY',
            value: process.env.OTP_API_KEY,
          },
          {
            key: 'Authorization',
            value: `Bearer ${authorization}`,
          },
        ],
        onSuccess: (response) => {
          resolve(response);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
}

export function saveOperator({ body }) {
  return () =>
    new Promise((resolve, reject) => {
      post({
        url: `${process.env.OTP_API}/operators`,
        type: 'POST',
        body,
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.api+json',
          },
          {
            key: 'OTP-API-KEY',
            value: process.env.OTP_API_KEY,
          },
        ],
        onSuccess: (response) => {
          resolve(response);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
}

export function updateOperator({ body, id, authorization }) {
  return () =>
    new Promise((resolve, reject) => {
      post({
        url: `${process.env.OTP_API}/operators/${id}`,
        type: 'PATCH',
        body,
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.api+json',
          },
          {
            key: 'OTP-API-KEY',
            value: process.env.OTP_API_KEY,
          },
          {
            key: 'Authorization',
            value: `Bearer ${authorization}`,
          },
        ],
        onSuccess: (response) => {
          resolve(response);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
}

export function updateFmu({ id, body, authorization }) {
  return () =>
    new Promise((resolve, reject) => {
      post({
        url: `${process.env.OTP_API}/fmus/${id}`,
        type: 'PATCH',
        body,
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.api+json',
          },
          {
            key: 'Authorization',
            value: `Bearer ${authorization}`,
          },
          {
            key: 'OTP-API-KEY',
            value: process.env.OTP_API_KEY,
          },
        ],
        onSuccess: (response) => {
          resolve(response);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
}

export function saveNewsLetter({ body }) {
  return () =>
    new Promise((resolve, reject) => {
      post({
        url: `${process.env.OTP_API}/contacts`,
        type: 'POST',
        body,
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'OTP-API-KEY',
            value: process.env.OTP_API_KEY,
          },
        ],
        onSuccess: (response) => {
          resolve(response);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
}
