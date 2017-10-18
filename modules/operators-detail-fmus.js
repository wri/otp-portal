const SET_OPERATORS_DETAIL_FMUS_MAP_LOCATION = 'SET_OPERATORS_DETAIL_FMUS_MAP_LOCATION';

/* Initial state */
const initialState = {
  map: {
    zoom: 5,
    center: {
      lat: 0,
      lng: 18
    },
    scrollZoom: false
  }
};

/* Reducer */
export default function (state = initialState, action) {
  switch (action.type) {
    case SET_OPERATORS_DETAIL_FMUS_MAP_LOCATION: {
      const map = Object.assign({}, state.map, action.payload);
      return Object.assign({}, state, { map });
    }
    default:
      return state;
  }
}

// SETTERS
export function setMapLocation(mapLocation) {
  return {
    type: SET_OPERATORS_DETAIL_FMUS_MAP_LOCATION,
    payload: mapLocation
  };
}
