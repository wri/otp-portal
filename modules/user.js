import Jsona from 'jsona';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';

import API, { NEXTAPIClient } from 'services/api'

import { logEvent } from 'utils/analytics';

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
    // Fields
    const fields = {
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

    return API.get(`operators/${id}`, {
      include: includeFields.join(','),
      'fields[fmus]': fields.fmus.join(',')
    }).then((operator) => {
      // Fetch from server ok -> Dispatch operator and deserialize the data
      const dataParsed = JSONA.deserialize(operator);

      dispatch({
        type: GET_USER_OPERATOR_SUCCESS,
        payload: dataParsed,
      });
    }).catch((err) => {
      // Fetch from server ko -> Dispatch error
      dispatch({
        type: GET_USER_OPERATOR_ERROR,
        payload: err.message,
      });
    });
  };
}

export function login({ body }) {
  return NEXTAPIClient.post('login', { body }).then(() => {
    localStorage.removeItem('notificationsShown');
    logEvent('login', { method: 'credentials' });
  });
}

export function logout() {
  return () => NEXTAPIClient.delete('logout').then(() => {
    window.location.reload();
  })
 }

export function resetPassword(attributes) {
  return API.post('users/password', {
    body: {
      password: attributes
    }
  }).then((data) => JSONA.deserialize(data));
}

export function forgotPassword(email) {
  return API.post('reset-password', { body: { password: { email } } });
}

export function getUserProfile() {
  return (dispatch, getState) => {
    const { user } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_USER_PROFILE_LOADING });

    return API.get(`users/${user.user_id}`, null, { token: user.token })
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
  return () => API.post('register', { body })
}

export function updateUserProfile({ attributes }) {
  return (dispatch, getState) => {
    const { user } = getState();

    return API.patch(`users/${user.user_id}`, {
      body: {
        data: {
          id: user.user_id,
          type: 'users',
          attributes: omitBy(attributes, isEmpty)
        }
      },
      token: user.token
    });
  }
}

export function saveOperator({ body }) {
  return () => API.post('operators', { body });
}

export function updateOperator({ body, id, authorization }) {
  return () => API.patch(`operators/${id}`, { body, token: authorization });
}

export function updateFmu({ id, body, authorization }) {
  return () => API.patch(`fmus/${id}`, { body, token: authorization });
}
