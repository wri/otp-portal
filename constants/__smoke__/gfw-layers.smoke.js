import { describe, it, expect, beforeAll } from 'vitest';

import { LAYERS, getIntegratedAlertsSource } from 'constants/layers';

// Live checks against GFW. Run on a schedule via `yarn test:smoke`, never in the PR suite.
const GFW_DATA_API = 'https://data-api.globalforestwatch.org';
// Congo Basin tile inside every layer's zoom range
const TILE = { z: 6, x: 37, y: 31 };

const layerSource = (id) => LAYERS.find((l) => l.id === id).config.source;
const tileUrl = (source) =>
  source.tiles[0].replace('{z}', TILE.z).replace('{x}', TILE.x).replace('{y}', TILE.y);

async function expectDirectPng(url) {
  const response = await fetch(url, { redirect: 'manual' });

  expect(response.status, `${url} -> ${response.headers.get('location') || response.status}`).toBe(200);
  expect(response.headers.get('content-type')).toBe('image/png');
}

describe('GFW tile layers', () => {
  it.each(['loss', 'gain'])('%s tiles load without a redirect', (id) =>
    expectDirectPng(tileUrl(layerSource(id)))
  );
});

describe('GFW integrated alerts', () => {
  let dataset;

  beforeAll(async () => {
    const response = await fetch(`${GFW_DATA_API}/dataset/gfw_integrated_alerts/latest`);
    if (!response.ok) throw new Error(`metadata request failed: ${response.status}`);

    ({ data: dataset } = await response.json());
  });

  it('metadata exposes the latest version', () => {
    expect(dataset.version).toMatch(/^v\d{8}/);
  });

  // GFW's own map moved to gfw_integrated_dist_alerts, so this dataset going stale is a likely failure
  it('dataset is still being updated', () => {
    const ageDays = (Date.now() - new Date(dataset.metadata.content_date_range.end_date)) / 86400000;

    expect(ageDays).toBeLessThan(14);
  });

  it('versioned tiles load without a redirect', () =>
    expectDirectPng(tileUrl(getIntegratedAlertsSource(dataset.version)))
  );

  it('latest fallback tiles still resolve', async () => {
    const response = await fetch(tileUrl(layerSource('integrated-alerts')));

    expect(response.status).toBe(200);
  });
});
