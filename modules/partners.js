import Jsona from 'jsona';
import fetch from 'isomorphic-fetch';

/* Constants */
const GET_PARTNERS_SUCCESS = 'GET_PARTNERS_SUCCESS';
const GET_PARTNERS_ERROR = 'GET_PARTNERS_ERROR';
const GET_PARTNERS_LOADING = 'GET_PARTNERS_LOADING';

const JSONA = new Jsona();

/* Initial state */
const initialState = {
  data: [
    {
      logo: 'http://diylogodesigns.com/blog/wp-content/uploads/2016/04/new-google-logo-png.png',
      title: 'Google',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
      url: 'https://www.google.es'
    },
    {
      logo: 'http://diylogodesigns.com/blog/wp-content/uploads/2016/04/new-google-logo-png.png',
      title: 'Facebook',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      url: 'https://www.google.es'
    },
    {
      logo: 'http://diylogodesigns.com/blog/wp-content/uploads/2016/04/new-google-logo-png.png',
      title: 'Other partner',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor.',
      url: 'https://www.google.es'
    },
    {
      logo: 'http://diylogodesigns.com/blog/wp-content/uploads/2016/04/new-google-logo-png.png',
      title: 'Other partner',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      url: 'https://www.google.es'
    },
    {
      logo: 'http://diylogodesigns.com/blog/wp-content/uploads/2016/04/new-google-logo-png.png',
      title: 'Other partner',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      url: 'https://www.google.es'
    }
  ],
  loading: false,
  error: false,
  map: {
    zoom: 5,
    center: {
      lat: 0,
      lng: 18
    }
  }
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_PARTNERS_SUCCESS:
      return Object.assign({}, state, { data: action.payload, loading: false, error: false });
    case GET_PARTNERS_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_PARTNERS_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    default:
      return state;
  }
}

export function getPartners() {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_PARTNERS_LOADING });

    fetch(`${process.env.OTP_API}/partners?page[size]=2000`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((partners) => {
        const dataParsed = JSONA.deserialize(partners);

        dispatch({
          type: GET_PARTNERS_SUCCESS,
          payload: dataParsed
        });
      })
      .catch((err) => {
        console.error(err);
        // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_PARTNERS_ERROR,
          payload: err.message
        });
      });
  };
}
