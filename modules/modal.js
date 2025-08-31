import { createSlice } from '@reduxjs/toolkit';

const modalSlice = createSlice({
  name: 'modal',
  initialState: {
    opened: false,
    options: {
      children: null,
      childrenProps: null,
      size: ''
    },
    loading: false
  },
  reducers: {
    toggleModal: (state, action) => {
      state.opened = action.payload;
    },
    setModalOptions: (state, action) => {
      state.options = action.payload;
    },
    toggleModalLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setModalOptions, toggleModalLoading } = modalSlice.actions;

export function toggleModal(opened, opts = {}) {
  return (dispatch) => {
    if (opened && opts) {
      dispatch(setModalOptions(opts));
    }

    dispatch(modalSlice.actions.toggleModal(opened));
  };
}

export default modalSlice.reducer;
