import { createSlice } from '@reduxjs/toolkit';
import { addApiCases, createApiThunk } from 'utils/redux-helpers';

export const getSawMillLocationById = createApiThunk(
  'sawmillMap/getSawMillLocationById', 
  (id) => `sawmills/${id}`, 
  { useLanguage: false }
);

const sawmillMapSlice = createSlice({
  name: 'sawmillMap',
  initialState: {
    viewport: {
      zoom: 5,
      latitude: 0,
      longitude: 18,
    },
    loading: false,
    error: false,
    sawmill: {},
  },
  reducers: {
    setMapLocation: (state, action) => {
      state.viewport = { ...state.viewport, ...action.payload };
    },
    unmountMap: (state) => {
      return {
        viewport: {
          zoom: 5,
          latitude: 0,
          longitude: 18,
        },
        loading: false,
        error: false,
        sawmill: {},
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSawMillLocationById.pending, (state) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getSawMillLocationById.fulfilled, (state, action) => {
        state.sawmill = action.payload;
        state.loading = false;
        state.error = false;
      })
      .addCase(getSawMillLocationById.rejected, (state) => {
        state.error = true;
        state.loading = false;
      });
  },
});

export const { setMapLocation, unmountMap } = sawmillMapSlice.actions;
export default sawmillMapSlice.reducer;
