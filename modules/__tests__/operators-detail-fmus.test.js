import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import { fetchIntegratedAlertsMetadata } from 'services/layers';

import reducer, {
  getIntegratedAlertsMetadata,
  setOperatorsDetailAnalysis,
  setOperatorsDetailMapLocation,
  setOperatorsDetailFmuBounds,
  setOperatorsDetailMapLayersSettings,
  setOperatorsDetailMapLayersActive
} from '../operators-detail-fmus';

vi.mock('services/layers', () => ({ fetchIntegratedAlertsMetadata: vi.fn() }));

const createStore = () => configureStore({ reducer: { operatorsDetailFmus: reducer } });
const analysisState = (store) => store.getState().operatorsDetailFmus.analysis;

const jsonResponse = (body) => ({ ok: true, json: () => Promise.resolve(body) });
const errorResponse = { ok: false, statusText: 'Server Error' };

const FMU = {
  id: '10',
  geojson: { type: 'FeatureCollection', features: [] },
  loss: { startDate: '2001-01-01', trimEndDate: '2023-12-31' },
  'integrated-alerts': { startDate: '2024-09-10', trimEndDate: '2026-09-10' }
};

// routes each request to a response by url, so the order of parallel requests does not matter
const mockFetch = (routes) => {
  const fetchMock = vi.fn((url) => {
    const route = Object.keys(routes).find((part) => String(url).includes(part));
    return Promise.resolve(route ? routes[route] : errorResponse);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};
const requestedUrls = (fetchMock) => fetchMock.mock.calls.map(([url]) => new URL(url));

describe('operators detail fmus reducer', () => {
  it('merges map location into the current viewport', () => {
    const state = reducer(undefined, setOperatorsDetailMapLocation({ zoom: 8 }));

    expect(state.map).toEqual({ zoom: 8, latitude: 0, longitude: 20, scrollZoom: false });
  });

  it('stores fmu bounds', () => {
    const state = reducer(undefined, setOperatorsDetailFmuBounds([[1, 2], [3, 4]]));

    expect(state.fmuBounds).toEqual([[1, 2], [3, 4]]);
  });

  it('merges layer settings per layer', () => {
    let state = reducer(undefined, setOperatorsDetailMapLayersSettings({ id: 'loss', settings: { opacity: 0.5 } }));
    state = reducer(state, setOperatorsDetailMapLayersSettings({ id: 'loss', settings: { visibility: false } }));

    expect(state.layersSettings).toEqual({ loss: { opacity: 0.5, visibility: false } });
  });

  it('replaces active layers', () => {
    const state = reducer(undefined, setOperatorsDetailMapLayersActive(['fmusdetail']));

    expect(state.layersActive).toEqual(['fmusdetail']);
  });
});

describe('getIntegratedAlertsMetadata', () => {
  it('drops the alerts layer when there is no metadata', async () => {
    fetchIntegratedAlertsMetadata.mockResolvedValue({});
    const store = createStore();
    store.dispatch(setOperatorsDetailMapLayersActive(['gain', 'integrated-alerts', 'fmusdetail']));

    await store.dispatch(getIntegratedAlertsMetadata());

    expect(store.getState().operatorsDetailFmus.layersActive).toEqual(['gain', 'fmusdetail']);
  });

  it('adds the alerts layer below fmus once, with a two year range', async () => {
    fetchIntegratedAlertsMetadata.mockResolvedValue({ minDataDate: '2014-12-31', maxDataDate: '2026-09-10' });
    const store = createStore();

    await store.dispatch(getIntegratedAlertsMetadata());
    await store.dispatch(getIntegratedAlertsMetadata());

    const { layersActive, layersSettings } = store.getState().operatorsDetailFmus;
    expect(layersActive).toEqual(['gain', 'loss', 'integrated-alerts', 'fmusdetail']);
    expect(layersSettings['integrated-alerts'].timelineParams).toEqual({
      minDate: '2024-09-10',
      maxDate: '2026-09-10',
      minDataDate: '2014-12-31'
    });
  });

  it('rejects when the metadata request fails', async () => {
    fetchIntegratedAlertsMetadata.mockRejectedValue(new Error('offline'));

    const action = await createStore().dispatch(getIntegratedAlertsMetadata());

    expect(action.payload).toBe('offline');
  });
});

describe('setOperatorsDetailAnalysis', () => {
  beforeEach(() => {
    vi.stubEnv('RW_API', 'https://rw.example.org');
    vi.stubEnv('GFW_PROXY_API', 'https://gfw.example.org');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('does nothing for an fmu without geometry', async () => {
    const fetchMock = mockFetch({});

    await createStore().dispatch(setOperatorsDetailAnalysis({ fmu: { id: '10' }, type: 'loss' }));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('creates a geostore and stores tree cover gain and loss', async () => {
    const fetchMock = mockFetch({
      '/geostore': jsonResponse({ data: { id: 'geo-1' } }),
      'group_by=is__umd_tree_cover_gain': jsonResponse({ data: [{ area__ha: 12.5 }] }),
      'group_by=umd_tree_cover_loss__year': jsonResponse({ data: [{ area__ha: 1 }, { area__ha: 2.5 }] })
    });
    const store = createStore();

    await store.dispatch(setOperatorsDetailAnalysis({ fmu: FMU, type: 'loss' }));
    await vi.waitFor(() => expect(analysisState(store).data['10']).toBeDefined());

    expect(analysisState(store)).toEqual({
      data: { 10: { geostore: 'geo-1', gain: { gain: 12.5 }, loss: { loss: 3.5 } } },
      loading: { loss: false },
      error: { loss: false }
    });

    const [geostore, ...zonal] = fetchMock.mock.calls;
    expect(geostore[0]).toBe('https://rw.example.org/geostore');
    expect(JSON.parse(geostore[1].body)).toEqual({ geojson: FMU.geojson });
    expect(zonal.map(([url]) => new URL(url).pathname)).toEqual([
      '/analysis/zonal/geo-1',
      '/analysis/zonal/geo-1'
    ]);
    expect(new URL(zonal[0][0]).searchParams.get('end_date')).toBe('2023-12-31');
  });

  it('reuses the stored geostore', async () => {
    const fetchMock = mockFetch({
      '/geostore': jsonResponse({ data: { id: 'geo-1' } }),
      '/analysis/zonal': jsonResponse({ data: [] })
    });
    const store = createStore();

    await store.dispatch(setOperatorsDetailAnalysis({ fmu: FMU, type: 'loss' }));
    await vi.waitFor(() => expect(analysisState(store).data['10']).toBeDefined());
    fetchMock.mockClear();

    await store.dispatch(setOperatorsDetailAnalysis({ fmu: FMU, type: 'loss' }));

    expect(requestedUrls(fetchMock).map((url) => url.pathname)).toEqual([
      '/analysis/zonal/geo-1',
      '/analysis/zonal/geo-1'
    ]);
    expect(analysisState(store).data['10']).toMatchObject({ gain: { gain: 0 }, loss: { loss: 0 } });
  });

  it('marks the analysis as failed when the geostore cannot be created', async () => {
    mockFetch({ '/geostore': errorResponse });
    const store = createStore();

    await store.dispatch(setOperatorsDetailAnalysis({ fmu: FMU, type: 'loss' }));

    expect(analysisState(store)).toMatchObject({ loading: { loss: false }, error: { loss: true } });
  });

  it('marks the analysis as failed when the zonal analysis fails', async () => {
    mockFetch({ '/geostore': jsonResponse({ data: { id: 'geo-1' } }) });
    const store = createStore();

    await store.dispatch(setOperatorsDetailAnalysis({ fmu: FMU, type: 'loss' }));
    await vi.waitFor(() => expect(analysisState(store).error.loss).toBe(true));

    expect(analysisState(store).loading.loss).toBe(false);
  });

  it('queries integrated alerts for the fmu date range', async () => {
    const alerts = [{ gfw_integrated_alerts__confidence: 'high', count: 3, area__ha: 1.5 }];
    const fetchMock = mockFetch({
      '/geostore': jsonResponse({ data: { id: 'geo-1' } }),
      '/dataset/gfw_integrated_alerts': jsonResponse({ data: alerts })
    });
    const store = createStore();

    await store.dispatch(setOperatorsDetailAnalysis({ fmu: FMU, type: 'integrated-alerts' }));
    await vi.waitFor(() => expect(analysisState(store).data['10']).toBeDefined());

    expect(analysisState(store)).toEqual({
      data: { 10: { geostore: 'geo-1', 'integrated-alerts': alerts } },
      loading: { 'integrated-alerts': false },
      error: { 'integrated-alerts': false }
    });

    const query = requestedUrls(fetchMock)[1];
    expect(query.searchParams.get('geostore_id')).toBe('geo-1');
    expect(query.searchParams.get('sql')).toContain("gfw_integrated_alerts__date >= '2024-09-10'");
    expect(query.searchParams.get('sql')).toContain("gfw_integrated_alerts__date <= '2026-09-10'");
  });

  it('skips the alerts query until the layer metadata is loaded', async () => {
    const fetchMock = mockFetch({ '/geostore': jsonResponse({ data: { id: 'geo-1' } }) });
    const fmu = { ...FMU, 'integrated-alerts': { startDate: undefined, trimEndDate: undefined } };

    await createStore().dispatch(setOperatorsDetailAnalysis({ fmu, type: 'integrated-alerts' }));

    expect(requestedUrls(fetchMock).map((url) => url.pathname)).toEqual(['/geostore']);
  });

  it('marks integrated alerts as failed when the query fails', async () => {
    mockFetch({ '/geostore': jsonResponse({ data: { id: 'geo-1' } }) });
    const store = createStore();

    await store.dispatch(setOperatorsDetailAnalysis({ fmu: FMU, type: 'integrated-alerts' }));
    await vi.waitFor(() => expect(analysisState(store).error['integrated-alerts']).toBe(true));
  });
});
