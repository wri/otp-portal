import { sumBy } from 'utils/general';
import { withIntegratedAlerts } from 'services/integrated-alerts-layer';

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

const ZONAL = {
  gain: {
    sum: 'area__ha',
    filters: 'is__umd_tree_cover_gain',
    group_by: 'is__umd_tree_cover_gain'
  },
  loss: {
    sum: 'area__ha',
    filters: 'umd_tree_cover_density_2000__30', // extentYear: 2000, threshold: 30
    group_by: 'umd_tree_cover_loss__year'
  }
};

const fetchJson = (url, options) => fetch(url, options).then((response) => {
  if (response.ok) return response.json();
  throw new Error(response.statusText);
});

function fetchZonalAnalysis(geostoreId, startDate, endDate, analysis) {
  const url = new URL(`${process.env.GFW_PROXY_API}/analysis/zonal/${geostoreId}`);
  url.searchParams.set('geostore_origin', 'rw');
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);
  url.searchParams.set('sum', ZONAL[analysis].sum);
  url.searchParams.set('filters', ZONAL[analysis].filters);
  url.searchParams.set('group_by', ZONAL[analysis].group_by);

  return fetchJson(url.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' } });
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
  const sql = `
    SELECT count(*), SUM(area__ha)
    FROM data
    WHERE gfw_integrated_alerts__date >= '${startDate}' AND
          gfw_integrated_alerts__date <= '${trimEndDate}'
    GROUP BY gfw_integrated_alerts__confidence
  `;
  const url = new URL(`${process.env.GFW_PROXY_API}/dataset/gfw_integrated_alerts/latest/query`);
  url.searchParams.set('geostore_id', geostoreId);
  url.searchParams.set('geostore_origin', 'rw');
  url.searchParams.set('sql', sql);

  const response = await fetchJson(url.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' } });
  // e.g. [{ gfw_integrated_alerts__confidence: 'high', count: 1232, area__ha: 15.15 }]
  return { 'integrated-alerts': response && response.data };
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
      const { data } = await fetchJson(`${process.env.RW_API}/geostore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geojson: fmu.geojson })
      });
      geostoreId = data.id;
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
