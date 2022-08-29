// CONSTANTS
const SET_LANGUAGE = 'SET_LANGUAGE';

// REDUCER
const initialState = 'en';

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_LANGUAGE:
      return action.payload;
    default:
      return state;
  }
}

// ACTIONS
export function setLanguage(lang) {
  return { type: SET_LANGUAGE, payload: lang };
}
