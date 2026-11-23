// GFW data API (via GFW_PROXY_API) and the RW geostore that its analysis endpoints read shapes from.
import { captureException } from 'utils/sentry';

export function fetchIntegratedAlertsMetadata() {
  return fetch(`${process.env.GFW_PROXY_API}/dataset/gfw_integrated_alerts/latest`, {
    method: 'GET'
  })
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error(response.statusText);
    })
    .then(({ data }) => {
      const minDataDate = data.metadata.content_date_range.start_date;
      const maxDataDate = data.metadata.content_date_range.end_date;

      if (!minDataDate || !maxDataDate) {
        throw new Error('No min or max date found for integrated alerts layer');
      }

      return {
        minDataDate,
        maxDataDate,
        version: data.version
      }
    })
    .catch((err) => {
      captureException(err);
      console.error(err);

      return {
        minDataDate: null,
        maxDataDate: null,
        version: null
      }
    });
}

const fetchJson = (url, options = {}) => fetch(url, {
  ...options,
  headers: { 'Content-Type': 'application/json', ...options.headers }
}).then((response) => {
  if (response.ok) return response.json();
  throw new Error(response.statusText);
});

// Resolves with the geostore ({ id, ... }) that the analysis endpoints take for this geometry
export function createGeostore(geojson) {
  return fetchJson(`${process.env.RW_API}/geostore`, {
    method: 'POST',
    body: JSON.stringify({ geojson })
  }).then(({ data }) => data);
}

const ZONAL_ANALYSIS = {
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
};

// Tree cover `kind` ('gain' or 'loss') inside the geostore between the dates
export function fetchZonalAnalysis(geostoreId, startDate, endDate, kind) {
  const url = new URL(`${process.env.GFW_PROXY_API}/analysis/zonal/${geostoreId}`);

  url.searchParams.set('geostore_origin', 'rw');
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);
  url.searchParams.set('sum', ZONAL_ANALYSIS[kind].sum);
  url.searchParams.set('filters', ZONAL_ANALYSIS[kind].filters);
  url.searchParams.set('group_by', ZONAL_ANALYSIS[kind].group_by);

  return fetchJson(url.toString(), { method: 'GET' });
}

// Alert count and area per confidence level, e.g.
// [{ gfw_integrated_alerts__confidence: 'high', count: 1232, area__ha: 15.15 }]
export function fetchIntegratedAlertsAnalysis(geostoreId, startDate, endDate) {
  const sql = `
    SELECT count(*), SUM(area__ha)
    FROM data
    WHERE gfw_integrated_alerts__date >= '${startDate}' AND
          gfw_integrated_alerts__date <= '${endDate}'
    GROUP BY gfw_integrated_alerts__confidence
  `;
  const url = new URL(`${process.env.GFW_PROXY_API}/dataset/gfw_integrated_alerts/latest/query`);

  url.searchParams.set('geostore_id', geostoreId);
  url.searchParams.set('geostore_origin', 'rw');
  url.searchParams.set('sql', sql);

  return fetchJson(url.toString(), { method: 'GET' }).then((response) => response && response.data);
}
