import { describe, it, expect, vi } from 'vitest';

import { LAYERS, getIntegratedAlertsSource } from 'constants/layers';
import { fetchIntegratedAlertsMetadata } from 'services/gfw';

import { fetchIntegratedAlertsSettings, withIntegratedAlerts } from 'utils/integrated-alerts-layer';

vi.mock('services/gfw', () => ({ fetchIntegratedAlertsMetadata: vi.fn() }));

const METADATA = { minDataDate: '2014-12-31', maxDataDate: '2026-09-10', version: 'v20260910' };
const alertsSource = () => LAYERS.find((l) => l.id === 'integrated-alerts').config.source;

describe('getIntegratedAlertsSource', () => {
  it('pins the tiles to the given version and keeps the zoom range', () => {
    expect(getIntegratedAlertsSource('v20260910')).toEqual({
      ...alertsSource(),
      tiles: [
        'https://tiles.globalforestwatch.org/gfw_integrated_alerts/v20260910/dynamic/{z}/{x}/{y}.png?render_type=encoded'
      ]
    });
  });

  it('leaves the shared latest url in LAYERS untouched', () => {
    getIntegratedAlertsSource('v20260910');

    expect(alertsSource().tiles[0]).toContain('/latest/');
  });
});

describe('fetchIntegratedAlertsSettings', () => {
  it('pins the alerts tiles to the metadata version', async () => {
    fetchIntegratedAlertsMetadata.mockResolvedValue(METADATA);

    expect((await fetchIntegratedAlertsSettings()).source).toEqual(getIntegratedAlertsSource('v20260910'));
  });

  it('keeps the latest url when the metadata has no version', async () => {
    fetchIntegratedAlertsMetadata.mockResolvedValue({ ...METADATA, version: undefined });

    expect(await fetchIntegratedAlertsSettings()).not.toHaveProperty('source');
  });

  it('has no settings without a date range', async () => {
    fetchIntegratedAlertsMetadata.mockResolvedValue({ version: 'v20260910' });

    expect(await fetchIntegratedAlertsSettings()).toBeNull();
  });
});

describe('withIntegratedAlerts', () => {
  const layers = { layersActive: ['gain', 'loss', 'fmus'], layersSettings: {} };

  it('shows the alerts just below the given layer, with the settings', () => {
    const { layersActive, layersSettings } = withIntegratedAlerts(layers, { decodeParams: {} }, 'fmus');

    expect(layersActive).toEqual(['gain', 'loss', 'integrated-alerts', 'fmus']);
    expect(layersSettings['integrated-alerts']).toEqual({ decodeParams: {} });
  });

  it('drops the alerts layer without settings', () => {
    const shown = { ...layers, layersActive: ['gain', 'integrated-alerts', 'fmus'] };

    expect(withIntegratedAlerts(shown, null, 'fmus').layersActive).toEqual(['gain', 'fmus']);
  });
});
