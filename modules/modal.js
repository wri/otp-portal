// CONSTANTS
const MODAL_TOGGLE = 'MODAL_TOGGLE';
const MODAL_TOGGLE_LOADING = 'MODAL_TOGGLE_LOADING';
const MODAL_SET_OPTIONS = 'MODAL_SET_OPTIONS';

// REDUCER
const initialState = {
  opened: false,
  options: {
    children: null,
    childrenProps: null,
    size: ''
  },
  loading: false
};

export default function modalReducer(state = initialState, action) {
  switch (action.type) {
    case MODAL_TOGGLE:
      return Object.assign({}, state, { opened: action.payload });
    case MODAL_SET_OPTIONS:
      return Object.assign({}, state, { options: action.payload });
    case MODAL_TOGGLE_LOADING:
      return Object.assign({}, state, { loading: action.payload });
    default:
      return state;
  }
}


// ACTIONS
export function toggleModal(opened, opts = {}) {
  return (dispatch) => {
    if (opened && opts) {
      dispatch({ type: MODAL_SET_OPTIONS, payload: opts });
    }
    dispatch({ type: MODAL_TOGGLE, payload: opened });
  };
}

export function setModalOptions(opts = {}) {
  return dispatch => dispatch({ type: MODAL_SET_OPTIONS, payload: opts });
}
