import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('services/api', () => ({ default: { get: vi.fn() } }));
vi.mock('services/server/request-context', () => ({ getRequestCookie: () => 'otp_auth_token=abc' }));

const { default: API } = await import('services/api');
const { fetchApi, settle } = await import('services/fetch-api');

const respond = (data) => API.get.mockResolvedValueOnce({ data, response: {} });

describe('fetchApi', () => {
  beforeEach(() => API.get.mockReset());
  afterEach(() => { delete globalThis.window; });

  it('sends locale and params, and the session only when asked', async () => {
    respond([1]);
    respond([2]);

    expect(await fetchApi('donors', { locale: 'fr', params: { 'page[size]': 2000 } })).toEqual([1]);
    await fetchApi('countries/7', { auth: true });

    expect(API.get.mock.calls[0]).toEqual(['donors', { locale: 'fr', 'page[size]': 2000 }, { auth: false }]);
    expect(API.get.mock.calls[1]).toEqual(['countries/7', {}, { auth: true, cookie: 'otp_auth_token=abc' }]);
  });

  it('never caches on the server', async () => {
    respond([1]);
    respond([2]);

    await fetchApi('faqs', { cache: true });
    expect(await fetchApi('faqs', { cache: true })).toEqual([2]);
  });

  it('caches in the browser per endpoint and params, and refetches on reload', async () => {
    globalThis.window = {};
    respond(['en']);
    respond(['fr']);
    respond(['en again']);

    expect(await fetchApi('tools', { locale: 'en', cache: true })).toEqual(['en']);
    expect(await fetchApi('tools', { locale: 'en', cache: true })).toEqual(['en']);
    expect(await fetchApi('tools', { locale: 'fr', cache: true })).toEqual(['fr']);
    expect(await fetchApi('tools', { locale: 'en', cache: 'reload' })).toEqual(['en again']);
    expect(await fetchApi('tools', { locale: 'en', cache: true })).toEqual(['en again']);
    expect(API.get).toHaveBeenCalledTimes(3);
  });

  it('reuses a response for a number of milliseconds, then refetches', async () => {
    globalThis.window = {};
    vi.useFakeTimers();
    respond(['first']);
    respond(['second']);

    try {
      expect(await fetchApi('donors', { cache: 1000 })).toEqual(['first']);
      vi.advanceTimersByTime(999);
      expect(await fetchApi('donors', { cache: 1000 })).toEqual(['first']);
      vi.advanceTimersByTime(1);
      expect(await fetchApi('donors', { cache: 1000 })).toEqual(['second']);
      expect(API.get).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('drops a failed request from the cache so the next call retries', async () => {
    globalThis.window = {};
    API.get.mockRejectedValueOnce(new Error('boom'));
    respond(['ok']);

    await expect(fetchApi('how-tos', { cache: true })).rejects.toThrow('boom');
    expect(await fetchApi('how-tos', { cache: true })).toEqual(['ok']);
  });
});

describe('settle', () => {
  it('wraps data, and turns a failure into the fallback with an error flag', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(await settle(Promise.resolve([1]), [])).toEqual({ data: [1], error: false });
    expect(await settle(Promise.reject(new Error('x')), [])).toEqual({ data: [], error: true });
  });
});
