import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { captureException } from 'utils/sentry';

import { fetchIntegratedAlertsMetadata } from '../layers';

vi.mock('utils/sentry', () => ({ captureException: vi.fn() }));

const METADATA = {
  data: {
    version: 'v20260910',
    metadata: { content_date_range: { start_date: '2014-12-31', end_date: '2026-09-10' } }
  }
};
const NO_METADATA = { minDataDate: null, maxDataDate: null, version: null };

describe('fetchIntegratedAlertsMetadata', () => {
  beforeEach(() => {
    vi.stubEnv('GFW_PROXY_API', 'https://gfw.example.org');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns the date range and version of the latest dataset', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(METADATA) });
    vi.stubGlobal('fetch', fetchMock);

    expect(await fetchIntegratedAlertsMetadata()).toEqual({
      minDataDate: '2014-12-31',
      maxDataDate: '2026-09-10',
      version: 'v20260910'
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://gfw.example.org/dataset/gfw_integrated_alerts/latest',
      { method: 'GET' }
    );
  });

  it('reports empty metadata instead of throwing when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, statusText: 'Bad Gateway' }));

    expect(await fetchIntegratedAlertsMetadata()).toEqual(NO_METADATA);
    expect(captureException).toHaveBeenCalledWith(expect.objectContaining({ message: 'Bad Gateway' }));
  });

  it('reports empty metadata when the dataset has no date range', async () => {
    const empty = { data: { version: 'v1', metadata: { content_date_range: {} } } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(empty) }));

    expect(await fetchIntegratedAlertsMetadata()).toEqual(NO_METADATA);
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'No min or max date found for integrated alerts layer' })
    );
  });
});
