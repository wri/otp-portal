import API from 'services/api'

/* Constants */
const GET_OPERATORS_SUCCESS = 'GET_OPERATORS_SUCCESS';
const GET_OPERATORS_ERROR = 'GET_OPERATORS_ERROR';
const GET_OPERATORS_LOADING = 'GET_OPERATORS_LOADING';

/* Initial state */
const initialState = {
  data: [],
  loading: false,
  error: false,
};

/* Reducer */
export default function Operators(state = initialState, action) {
  switch (action.type) {
    case GET_OPERATORS_SUCCESS:
      return Object.assign({}, state, {
        data: action.payload,
        loading: false,
        error: false,
      });
    case GET_OPERATORS_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_OPERATORS_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    default:
      return state;
  }
}

export function getOperators() {
  return (dispatch, getState) => {
    const { language } = getState();
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_OPERATORS_LOADING });

    return API.get('operators', {
      locale: language,
      include: 'country',
      'page[size]': 3000,
      'filter[country]': process.env.OTP_COUNTRIES_IDS.join(','),
      'filter[fa]': true,
      'fields[operators]': 'name,slug,country',
      'fields[countries]': 'name',
    })
      .then(({ data }) => {
        dispatch({
          type: GET_OPERATORS_SUCCESS,
          payload: data,
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_OPERATORS_ERROR,
          payload: err.message,
        });
      });
  };
}
