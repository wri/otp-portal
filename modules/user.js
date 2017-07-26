import * as Cookies from 'js-cookie';
import { post } from 'utils/request';

// CONSTANTS
const SET_USER = 'SET_USER';
const REMOVE_USER = 'REMOVE_USER';

// REDUCER
const initialState = (Cookies.get('user')) ? JSON.parse(Cookies.get('user')) : {};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return Object.assign({}, state, action.payload);
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

export function login({ body }) {
  return dispatch => new Promise((resolve, reject) => {
    post({
      url: `${process.env.OTP_API}/login`,
      type: 'POST',
      body,
      headers: [{
        key: 'Content-Type',
        value: 'application/json'
      }, {
        key: 'OTP-API-KEY',
        value: process.env.OTP_API_KEY
      }],
      onSuccess: (response) => {
        // Set cookie
        Cookies.set('user', JSON.stringify(response));

        // Dispatch action
        dispatch({ type: SET_USER, payload: response });

        resolve(response);
      },
      onError: (error) => {
        reject(error);
      }
    });
  });
}

export function logout() {
  return (dispatch) => {
    // Set cookie
    Cookies.remove('user');

    // Dispatch action
    dispatch({ type: REMOVE_USER, payload: {} });
  };
  // return dispatch => new Promise((resolve, reject) => {
  //   post({
  //     url: `${process.env.OTP_API}/logout`,
  //     type: 'POST',
  //     body: {},
  //     headers: [{
  //       key: 'Content-Type',
  //       value: 'application/json'
  //     }, {
  //       key: 'OTP-API-KEY',
  //       value: process.env.OTP_API_KEY
  //     }],
  //     onSuccess: (response) => {
  //       // Set cookie
  //       Cookies.remove('user');
  //
  //       // Dispatch action
  //       dispatch({ type: SET_USER, payload: {} });
  //
  //       resolve(response);
  //     },
  //     onError: (error) => {
  //       reject(error);
  //     }
  //   });
  // });
}
