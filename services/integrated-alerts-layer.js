import dayjs from 'dayjs';

import { fetchIntegratedAlertsMetadata } from 'services/layers';

// Settings for the GFW integrated alerts layer, covering the last two years of data, or null when
// the metadata has no date range.
export async function fetchIntegratedAlertsSettings() {
  const [{ minDataDate, maxDataDate, version }, { getIntegratedAlertsSource }] = await Promise.all([
    fetchIntegratedAlertsMetadata(),
    // imported lazily so the layer definitions stay out of _app
    import('constants/layers')
  ]);

  if (!minDataDate || !maxDataDate) return null;

  const startDate = dayjs(maxDataDate).subtract(2, 'years').format('YYYY-MM-DD');
  return {
    ...(version && { source: getIntegratedAlertsSource(version) }),
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
  };
}

// Shows the alerts layer just below `beforeLayerId` with the fetched settings, or drops it
export function withIntegratedAlerts({ layersActive, layersSettings }, settings, beforeLayerId) {
  if (!settings) {
    return { layersActive: layersActive.filter((l) => l !== 'integrated-alerts'), layersSettings };
  }

  const index = layersActive.indexOf(beforeLayerId);
  return {
    layersActive: [...new Set([...layersActive.slice(0, index), 'integrated-alerts', ...layersActive.slice(index)])],
    layersSettings: {
      ...layersSettings,
      'integrated-alerts': { ...layersSettings['integrated-alerts'], ...settings }
    }
  };
}
