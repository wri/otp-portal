import { describe, it, expect, vi } from 'vitest';

import { LAYERS, getIntegratedAlertsSource } from 'constants/layers';
import { fetchIntegratedAlertsMetadata } from 'services/layers';

import {
  getIntegratedAlertsMetadata as getRankingAlertsMetadata,
  setOperatorsMapLayersSettings
} from '../operators-ranking';
import { getIntegratedAlertsMetadata as getFmusAlertsMetadata } from '../operators-detail-fmus';

vi.mock('services/layers', () => ({ fetchIntegratedAlertsMetadata: vi.fn() }));

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

describe('operators ranking alerts metadata', () => {
  const settingsAfterFetch = async () => {
    const dispatch = vi.fn();
    const getState = () => ({ operatorsRanking: { layersActive: ['gain', 'loss', 'fmus'] } });

    await getRankingAlertsMetadata()(dispatch, getState);

    return dispatch.mock.calls.map(([action]) => action).find(setOperatorsMapLayersSettings.match).payload.settings;
  };

  it('pins the alerts tiles to the metadata version', async () => {
    fetchIntegratedAlertsMetadata.mockResolvedValue(METADATA);

    expect((await settingsAfterFetch()).source).toEqual(getIntegratedAlertsSource('v20260910'));
  });

  it('keeps the latest url when the metadata has no version', async () => {
    fetchIntegratedAlertsMetadata.mockResolvedValue({ ...METADATA, version: undefined });

    expect(await settingsAfterFetch()).not.toHaveProperty('source');
  });
});

describe('operator detail fmus alerts metadata', () => {
  const settingsAfterFetch = async () => {
    const getState = () => ({ operatorsDetailFmus: { layersActive: ['gain', 'loss', 'fmusdetail'] } });
    const action = await getFmusAlertsMetadata()(vi.fn(), getState, undefined);

    return action.payload.layersSettings.settings;
  };

  it('pins the alerts tiles to the metadata version', async () => {
    fetchIntegratedAlertsMetadata.mockResolvedValue(METADATA);

    expect((await settingsAfterFetch()).source).toEqual(getIntegratedAlertsSource('v20260910'));
  });

  it('keeps the latest url when the metadata has no version', async () => {
    fetchIntegratedAlertsMetadata.mockResolvedValue({ ...METADATA, version: undefined });

    expect(await settingsAfterFetch()).not.toHaveProperty('source');
  });
});
