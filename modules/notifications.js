import Jsona from 'jsona';

import API from 'services/api';

const GET_NOTIFICATIONS_SUCCESS = 'GET_NOTIFICATIONS_SUCCESS';
const GET_NOTIFICATIONS_ERROR = 'GET_NOTIFICATIONS_ERROR';
const GET_NOTIFICATIONS_LOADING = 'GET_NOTIFICATIONS_LOADING';

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
    case GET_NOTIFICATIONS_SUCCESS: {
      return Object.assign({}, state, { data: action.payload, loading: false, error: false });
    }
    case GET_NOTIFICATIONS_ERROR: {
      return Object.assign({}, state, { error: true, loading: false });
    }
    case GET_NOTIFICATIONS_LOADING: {
      return Object.assign({}, state, { loading: true, error: false });
    }
    default:
      return state;
  }
}

export function getNotifications() {
  return (dispatch, getState) => {
    const { language, user } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_NOTIFICATIONS_LOADING });

    return API.get('notifications', { locale: language }, { token: user.token })
      .then((data) => {
        const dataParsed = JSONA.deserialize(data);

        dispatch({
          type: GET_NOTIFICATIONS_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_NOTIFICATIONS_ERROR,
          payload: err.message
        });
      });
  };
}

export function dismissNotification(notificationId) {
  return API.put(`notifications/${notificationId}/dismiss`, null, { token})
}
