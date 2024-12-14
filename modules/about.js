import API from 'services/api';

const GET_ABOUT_SUCCESS = 'GET_ABOUT_SUCCESS';
const GET_ABOUT_ERROR = 'GET_ABOUT_ERROR';
const GET_ABOUT_LOADING = 'GET_ABOUT_LOADING';

/* Initial state */
const initialState = {
  data: [],
  loading: false,
  error: false
};

/* Reducer */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_ABOUT_SUCCESS: {
      return Object.assign({}, state, { data: action.payload, loading: false, error: false });
    }
    case GET_ABOUT_ERROR: {
      return Object.assign({}, state, { error: true, loading: false });
    }
    case GET_ABOUT_LOADING: {
      return Object.assign({}, state, { loading: true, error: false });
    }
    default:
      return state;
  }
}

export function getAbout() {
  return (dispatch, getState) => {
    const { language } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_ABOUT_LOADING });

    return API.get('about-page-entries', { locale: language })
      .then(({ data }) => {
        dispatch({
          type: GET_ABOUT_SUCCESS,
          payload: data
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_ABOUT_ERROR,
          payload: err.message
        });
      });
  };
}
