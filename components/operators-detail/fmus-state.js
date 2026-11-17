import { createGeostore, fetchIntegratedAlertsAnalysis, fetchZonalAnalysis } from 'services/gfw';
import { sumBy } from 'utils/general';
import { withIntegratedAlerts } from 'components/map/integrated-alerts-layer';

export const initialFmusState = {
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
  fmuBounds: undefined,
  analysis: {
    data: {},
    loading: {},
    error: {}
  }
};

const setAnalysisFlags = (analysis, type, loading, error) => ({
  ...analysis,
  loading: { ...analysis.loading, [type]: loading },
  error: { ...analysis.error, [type]: error }
});

export function fmusReducer(state, { type, payload }) {
  switch (type) {
    case 'mapLocation':
      return { ...state, map: { ...state.map, ...payload } };
    case 'fmuBounds':
      return { ...state, fmuBounds: payload };
    case 'layerSettings': {
      const { id, settings } = payload;
      return {
        ...state,
        layersSettings: { ...state.layersSettings, [id]: { ...state.layersSettings[id], ...settings } }
      };
    }
    case 'layersActive':
      return { ...state, layersActive: payload };
    case 'integratedAlerts':
      return { ...state, ...withIntegratedAlerts(state, payload, 'fmusdetail') };
    case 'analysisLoading':
      return { ...state, analysis: setAnalysisFlags(state.analysis, payload.type, true, false) };
    case 'analysisError':
      return { ...state, analysis: setAnalysisFlags(state.analysis, payload.type, false, true) };
    case 'analysisSuccess': {
      const { type: analysisType, fmuId, data } = payload;
      const analysis = setAnalysisFlags(state.analysis, analysisType, false, false);
      return {
        ...state,
        analysis: {
          ...analysis,
          data: { ...analysis.data, [fmuId]: { ...analysis.data[fmuId], ...data } }
        }
      };
    }
    default:
      return state;
  }
}

async function fetchTreeCover(geostoreId, fmu) {
  const { startDate, trimEndDate } = fmu.loss;
  const [gainResponse, lossResponse] = await Promise.all([
    fetchZonalAnalysis(geostoreId, startDate, trimEndDate, 'gain'),
    fetchZonalAnalysis(geostoreId, startDate, trimEndDate, 'loss'),
  ]);

  return {
    gain: { gain: (gainResponse.data && gainResponse.data[0] && gainResponse.data[0].area__ha) || 0 },
    loss: { loss: sumBy(lossResponse.data, 'area__ha') || 0 }
  };
}

async function fetchIntegratedAlerts(geostoreId, fmu) {
  const { startDate, trimEndDate } = fmu['integrated-alerts'];
  return { 'integrated-alerts': await fetchIntegratedAlertsAnalysis(geostoreId, startDate, trimEndDate) };
}

/**
 * Tree cover ('loss', which also covers gain) or 'integrated-alerts' analysis for one FMU. The FMU
 * geometry is registered once as an RW geostore; its id is kept with the results and reused.
 */
export async function runFmuAnalysis({ fmu, type }, dispatch, getState) {
  if (!fmu.geojson) return;
  dispatch({ type: 'analysisLoading', payload: { type } });

  try {
    let geostoreId = getState().analysis.data[fmu.id]?.geostore;
    if (!geostoreId) {
      geostoreId = (await createGeostore(fmu.geojson)).id;
    }

    // an invalid end date means the layer metadata is not loaded yet, so there is nothing to ask for
    if (type === 'integrated-alerts' && isNaN(Date.parse(fmu['integrated-alerts'].trimEndDate))) return;

    const results = type === 'integrated-alerts'
      ? await fetchIntegratedAlerts(geostoreId, fmu)
      : await fetchTreeCover(geostoreId, fmu);

    dispatch({ type: 'analysisSuccess', payload: { type, fmuId: fmu.id, data: { geostore: geostoreId, ...results } } });
  } catch (error) {
    dispatch({ type: 'analysisError', payload: { type } });
  }
}
