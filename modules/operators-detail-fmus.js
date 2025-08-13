import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import { fetchIntegratedAlertsMetadata } from 'services/layers';
import { sumBy } from 'utils/general';

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

      const response = await fetch(`${process.env.RW_API}/geostore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ geojson: fmu.geojson })
      });

      if (!response.ok) throw new Error(response.statusText);

      const { data } = await response.json();
      return await fetchAnalysis(dispatch, getState, data, fmu, type);
    } catch (err) {
      return rejectWithValue({ type, error: err.message });
    }
  }
);

export const getIntegratedAlertsMetadata = createAsyncThunk(
  'operatorsDetailFmus/getIntegratedAlertsMetadata',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { minDataDate, maxDataDate } = await fetchIntegratedAlertsMetadata();
      const { operatorsDetailFmus } = getState();
      const activeLayers = operatorsDetailFmus.layersActive;

      if (!minDataDate || !maxDataDate) {
        return {
          type: 'no-metadata',
          layersActive: activeLayers.filter(l => l !== 'integrated-alerts')
        };
      }

      const startDate = dayjs(maxDataDate).subtract(2, 'years').format('YYYY-MM-DD');

      return {
        type: 'success',
        layersSettings: {
          id: 'integrated-alerts',
          settings: {
            decodeParams: {
              startDate,
              endDate: maxDataDate,
              trimEndDate: maxDataDate,
              maxDate: maxDataDate
            },
            timelineParams: {
              minDate: startDate,
              maxDate: maxDataDate,
              minDataDate
            }
          }
        },
        layersActive: [... new Set([
          ...activeLayers.slice(0, activeLayers.indexOf('fmusdetail')),
          'integrated-alerts',
          ...activeLayers.slice(activeLayers.indexOf('fmusdetail'))
        ])]
      };
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
    latlng: {},
    interactions: {},
    layersActive: [
      'gain',
      'loss',
      // 'integrated-alerts', //activate when metadata is loaded
      'fmusdetail'
    ],
    layersSettings: {},
    fmu: undefined,
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
    setOperatorsDetailFmu: (state, action) => {
      state.fmu = action.payload;
    },
    setOperatorsDetailFmuBounds: (state, action) => {
      state.fmuBounds = action.payload;
    },
    setOperatorsDetailMapInteractions: (state, action) => {
      const { features = [], lngLat = {} } = action.payload;
      
      // could be more features for the same layer we reverse array
      // as the last one overrides the previous we will get the first on
      const interactions = features.slice().reverse().reduce(
        (obj, next) => ({
          ...obj,
          [next.layer.source]: {
            id: next.id,
            data: next.properties,
            geometry: next.geometry
          }
        }),
        {}
      );

      state.latlng = lngLat;
      state.interactions = interactions;
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
        const { type, layersActive, layersSettings } = action.payload;
        
        if (type === 'no-metadata') {
          state.layersActive = layersActive;
        } else {
          const { id, settings } = layersSettings;
          state.layersSettings = {
            ...state.layersSettings,
            [id]: {
              ...state.layersSettings[id],
              ...settings
            }
          };
          state.layersActive = layersActive;
        }
      });
  },
});

export const {
  setOperatorsDetailMapLocation,
  setOperatorsDetailFmu,
  setOperatorsDetailFmuBounds,
  setOperatorsDetailMapInteractions,
  setOperatorsDetailMapLayersSettings,
  setOperatorsDetailMapLayersActive,
  fmuAnalysisSuccess,
  fmuAnalysisLoading,
  fmuAnalysisError,
} = operatorsDetailFmusSlice.actions;



function fetchIntegratedAlertsAnalysis(dispatch, getState, data, fmu, type) {
  const geostoreId = data.id;
  const { startDate, trimEndDate } = fmu['integrated-alerts'];

  // if trimEndDate is not valid, that means we probably did not download layer metadata yet, do not fetch analysis
  if (isNaN(Date.parse(trimEndDate))) return null;

  const sql = `
    SELECT count(*), SUM(area__ha)
    FROM data
    WHERE gfw_integrated_alerts__date >= '${startDate}' AND
          gfw_integrated_alerts__date <= '${trimEndDate}'
    GROUP BY gfw_integrated_alerts__confidence
  `
  const url = new URL(`${process.env.GFW_PROXY_API}/dataset/gfw_integrated_alerts/latest/query`);

  url.searchParams.set('geostore_id', geostoreId);
  url.searchParams.set('geostore_origin', 'rw');
  url.searchParams.set('sql', sql);

  return fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error(response.statusText);
    })
    .then((response) => {
      const { operatorsDetailFmus } = getState();
      const { analysis } = operatorsDetailFmus;
      const { data: analysisData } = analysis;

      // response data array element example
      // { gfw_integrated_alerts__confidence: 'high', count: 1232, area__ha: 15.151760000000001 }

      dispatch(fmuAnalysisSuccess({
        type,
        data: {
          [fmu.id]: {
            geostore: data.id,
            ...analysisData[fmu.id],
            'integrated-alerts': response && response.data
          }
        }
      }));
    })
    .catch(error => dispatch(fmuAnalysisError({ type })));
}

const ANALYSIS = {
  'gain': {
    sum: 'area__ha',
    filters: 'is__umd_tree_cover_gain',
    group_by: 'is__umd_tree_cover_gain'
  },
  'loss': {
    sum: 'area__ha',
    filters: 'umd_tree_cover_density_2000__30', // extentYear: 2000, threshold: 30
    group_by: 'umd_tree_cover_loss__year'
  }
}

function fetchZonalAnalysis(geostoreId, startDate, endDate, analysis) {
  const url = new URL(`${process.env.GFW_PROXY_API}/analysis/zonal/${geostoreId}`);

  url.searchParams.set('geostore_origin', 'rw');
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);
  url.searchParams.set('sum', ANALYSIS[analysis].sum);
  url.searchParams.set('filters', ANALYSIS[analysis].filters);
  url.searchParams.set('group_by', ANALYSIS[analysis].group_by);

  return fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (response.ok) return response.json();
    throw new Error(response.statusText);
  });
}

function fetchAnalysis(dispatch, getState, data, fmu, type) {
  dispatch(fmuAnalysisLoading({ type }));

  if (type === 'integrated-alerts') return fetchIntegratedAlertsAnalysis(dispatch, getState, data, fmu, type);

  const { startDate, trimEndDate } = fmu[type];
  const geostoreId = data.id;

  return Promise.all([
    fetchZonalAnalysis(geostoreId, startDate, trimEndDate, 'gain'),
    fetchZonalAnalysis(geostoreId, startDate, trimEndDate, 'loss'),
  ])
    .then(([gainResponse, lossResponse]) => {
      const gain = (gainResponse.data && gainResponse.data[0] && gainResponse.data[0].area__ha) || 0;
      const loss = sumBy(lossResponse.data, 'area__ha') || 0;

      const { operatorsDetailFmus } = getState();
      const { analysis } = operatorsDetailFmus;
      const { data: analysisData } = analysis;

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
    .catch(error => {
      dispatch(fmuAnalysisError({ type }));
    });
}


export default operatorsDetailFmusSlice.reducer;
