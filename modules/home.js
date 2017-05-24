/* Constants */
const SET_HOME = 'SET_HOME';

/* Initial state */
const initialState = {
  name: 'home'
};

/* Reducer */
export default function scopeReducer(state = initialState, action) {
  switch (action.type) {
    case SET_HOME:
      return { name: action.payload };
    default:
      return state;
  }
}

/* Action creators */
export function setScope(scope) {
  return {
    type: SET_HOME,
    payload: scope
  };
}
