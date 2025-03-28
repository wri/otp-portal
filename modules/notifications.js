import API from 'services/api';

const GET_NOTIFICATIONS_SUCCESS = 'GET_NOTIFICATIONS_SUCCESS';
const GET_NOTIFICATIONS_ERROR = 'GET_NOTIFICATIONS_ERROR';
const GET_NOTIFICATIONS_LOADING = 'GET_NOTIFICATIONS_LOADING';
const SET_NOTIFICATIONS = 'SET_NOTIFICATIONS';

/* Initial state */
const initialState = {
  data: [],
  loading: false,
  error: false
};

/* Reducer */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_NOTIFICATIONS_SUCCESS:
    case SET_NOTIFICATIONS: {
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
      .then(({ data }) => {
        dispatch({
          type: GET_NOTIFICATIONS_SUCCESS,
          payload: data
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

export function dismissAll() {
  return (dispatch, getState) => {
    const { user, notifications } = getState();

    // don't have to wait for success message it's not critical, can happen in the background
    notifications.data.forEach((notification) => {
      API.put(`notifications/${notification.id}/dismiss`, { token: user.token });
    })
    dispatch({ type: SET_NOTIFICATIONS, payload: [] });
  }
}
