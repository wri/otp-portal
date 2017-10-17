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
      logo: '/static/images/logos/usaid.png',
      logo2: '/static/images/logos/carpe.png',
      title: 'U. S. Agency for International Development (USAID)',
      description: 'The U.S. Agency for International Development’s (USAID) Central Africa Regional Program for the Environment (CARPE) supports initiatives to improve the management of the Congo Basin’s biodiversity and natural resources. It is implemented in collaboration with African Parks, the African Wildlife Foundation, U.S. Fish and Wildlife Service, the U.S. Forest Service, the University of Maryland, the Wildlife Conservation Society, World Resources Institute, World Wildlife Fund and other partners.',
      maxWidth: '500px',
      url: 'https://www.usaid.gov',
      featured: true
    },
    {
      logo: '/static/images/logos/ukaid.png',
      title: 'UK Department of International Development (DFID)',
      description: '',
      maxWidth: '220px',
      url: 'https://www.ukaiddirect.org/'
    },
    {
      logo: '/static/images/logos/norwegian.png',
      title: 'Norwegian Ministry of Climate and Environment ',
      description: '',
      maxWidth: '220px',
      url: 'https://www.regjeringen.no/en/id4/'
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
