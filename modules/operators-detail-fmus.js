import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { createGeostore, fetchIntegratedAlertsAnalysis, fetchZonalAnalysis } from 'services/gfw';
import { fetchIntegratedAlertsSettings, withIntegratedAlerts } from 'components/map/integrated-alerts-layer';
import { sumBy } from 'utils/general';
import { registerReducer } from 'modules/registry';

export const setOperatorsDetailAnalysis = createAsyncThunk(
  'operatorsDetailFmus/setOperatorsDetailAnalysis',
  async ({ fmu, type }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { operatorsDetailFmus } = getState();
      const { analysis } = operatorsDetailFmus;
      const { data: analysisData } = analysis;

      if (!fmu.geojson) {
        return null;
      }

      if (analysisData && analysisData[fmu.id] && analysisData[fmu.id].geostore) {
        return await fetchAnalysis(dispatch, getState, { id: analysisData[fmu.id].geostore }, fmu, type);
      }

      const geostore = await createGeostore(fmu.geojson);
      return await fetchAnalysis(dispatch, getState, geostore, fmu, type);
    } catch (err) {
      return rejectWithValue({ type, error: err.message });
    }
  }
);

export const getIntegratedAlertsMetadata = createAsyncThunk(
  'operatorsDetailFmus/getIntegratedAlertsMetadata',
  async (_, { getState, rejectWithValue }) => {
    try {
      const settings = await fetchIntegratedAlertsSettings();
      return withIntegratedAlerts(getState().operatorsDetailFmus, settings, 'fmusdetail');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const operatorsDetailFmusSlice = createSlice({
  name: 'operatorsDetailFmus',
  initialState: {
    map: {
      zoom: 5,
      latitude: 0,
      longitude: 20,
      scrollZoom: false
    },
    layersActive: [
      'gain',
      'loss',
      // 'integrated-alerts', //activate when metadata is loaded
      'fmusdetail'
    ],
    layersSettings: {},
    fmusBounds: undefined,
    analysis: {
      data: {},
      loading: false,
      error: false
    }
  },
  reducers: {
    setOperatorsDetailMapLocation: (state, action) => {
      state.map = { ...state.map, ...action.payload };
    },
    setOperatorsDetailFmuBounds: (state, action) => {
      state.fmuBounds = action.payload;
    },
    setOperatorsDetailMapLayersSettings: (state, action) => {
      const { id, settings } = action.payload;
      state.layersSettings = {
        ...state.layersSettings,
        [id]: {
          ...state.layersSettings[id],
          ...settings
        }
      };
    },
    setOperatorsDetailMapLayersActive: (state, action) => {
      state.layersActive = action.payload;
    },
    fmuAnalysisSuccess: (state, action) => {
      const { type, data } = action.payload;
      state.analysis = {
        data: { ...state.analysis.data, ...data },
        loading: {
          ...state.analysis.loading,
          [type]: false
        },
        error: {
          ...state.analysis.error,
          [type]: false
        }
      };
    },
    fmuAnalysisLoading: (state, action) => {
      const { type } = action.payload;
      state.analysis = {
        ...state.analysis,
        loading: {
          ...state.analysis.loading,
          [type]: true
        },
        error: {
          ...state.analysis.error,
          [type]: false
        }
      };
    },
    fmuAnalysisError: (state, action) => {
      const { type } = action.payload;
      state.analysis = {
        ...state.analysis,
        loading: {
          ...state.analysis.loading,
          [type]: false
        },
        error: {
          ...state.analysis.error,
          [type]: true
        }
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setOperatorsDetailAnalysis.pending, (state, action) => {
        const { type } = action.meta.arg;
        state.analysis = {
          ...state.analysis,
          loading: {
            ...state.analysis.loading,
            [type]: true
          },
          error: {
            ...state.analysis.error,
            [type]: false
          }
        };
      })
      .addCase(setOperatorsDetailAnalysis.fulfilled, (state, action) => {
        // Analysis results are handled by the async functions themselves
        // through the fmuAnalysisSuccess action
      })
      .addCase(setOperatorsDetailAnalysis.rejected, (state, action) => {
        const { type } = action.payload || {};
        if (type) {
          state.analysis = {
            ...state.analysis,
            loading: {
              ...state.analysis.loading,
              [type]: false
            },
            error: {
              ...state.analysis.error,
              [type]: true
            }
          };
        }
      })
      .addCase(getIntegratedAlertsMetadata.fulfilled, (state, action) => {
        state.layersActive = action.payload.layersActive;
        state.layersSettings = action.payload.layersSettings;
      });
  },
});

export const {
  setOperatorsDetailMapLocation,
  setOperatorsDetailFmuBounds,
  setOperatorsDetailMapLayersSettings,
  setOperatorsDetailMapLayersActive,
  fmuAnalysisSuccess,
  fmuAnalysisLoading,
  fmuAnalysisError,
} = operatorsDetailFmusSlice.actions;



function loadIntegratedAlertsAnalysis(dispatch, getState, data, fmu, type) {
  const geostoreId = data.id;
  const { startDate, trimEndDate } = fmu['integrated-alerts'];

  // if trimEndDate is not valid, that means we probably did not download layer metadata yet, do not fetch analysis
  if (isNaN(Date.parse(trimEndDate))) return null;

  return fetchIntegratedAlertsAnalysis(geostoreId, startDate, trimEndDate)
    .then((alerts) => {
      const { data: analysisData } = getState().operatorsDetailFmus.analysis;

      dispatch(fmuAnalysisSuccess({
        type,
        data: {
          [fmu.id]: {
            geostore: data.id,
            ...analysisData[fmu.id],
            'integrated-alerts': alerts
          }
        }
      }));
    })
    .catch(() => dispatch(fmuAnalysisError({ type })));
}

function fetchAnalysis(dispatch, getState, data, fmu, type) {
  dispatch(fmuAnalysisLoading({ type }));

  if (type === 'integrated-alerts') return loadIntegratedAlertsAnalysis(dispatch, getState, data, fmu, type);

  const { startDate, trimEndDate } = fmu[type];
  const geostoreId = data.id;

  return Promise.all([
    fetchZonalAnalysis(geostoreId, startDate, trimEndDate, 'gain'),
    fetchZonalAnalysis(geostoreId, startDate, trimEndDate, 'loss'),
  ])
    .then(([gainResponse, lossResponse]) => {
      const gain = (gainResponse.data && gainResponse.data[0] && gainResponse.data[0].area__ha) || 0;
      const loss = sumBy(lossResponse.data, 'area__ha') || 0;

      const { data: analysisData } = getState().operatorsDetailFmus.analysis;

      dispatch(fmuAnalysisSuccess({
        type,
        data: {
          [fmu.id]: {
            geostore: data.id,
            ...analysisData[fmu.id],
            loss: { loss },
            gain: { gain }
          }
        }
      }));
    })
    .catch(() => {
      dispatch(fmuAnalysisError({ type }));
    });
}

registerReducer('operatorsDetailFmus', operatorsDetailFmusSlice.reducer);

export default operatorsDetailFmusSlice.reducer;
