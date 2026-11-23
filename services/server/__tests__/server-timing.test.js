import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ENABLED is read once at module load, so each case imports the module fresh
const load = async (enabled) => {
  vi.stubEnv('SERVER_TIMING', enabled ? 'true' : 'false');
  vi.resetModules();
  return import('../server-timing');
};

const res = () => ({ headers: {}, headersSent: false, setHeader(name, value) { this.headers[name] = value; } });

describe('server timing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('collects phases on the request and writes one header', async () => {
    const { track, sendServerTiming } = await load(true);
    const req = {};
    const response = res();

    const done = track(req, 'api');
    vi.advanceTimersByTime(12);
    done();
    track(req, 'render')();

    sendServerTiming(req, response);

    expect(req.__serverTiming).toHaveLength(2);
    expect(response.headers['Server-Timing']).toMatch(/^api;dur=\d+\.\d, render;dur=\d+\.\d$/);
  });

  it('does nothing when disabled', async () => {
    const { track, sendServerTiming } = await load(false);
    const req = {};
    const response = res();

    track(req, 'api')();
    sendServerTiming(req, response);

    expect(req.__serverTiming).toBeUndefined();
    expect(response.headers).toEqual({});
  });

  it('skips tracking without a request', async () => {
    const { track } = await load(true);

    expect(() => track(undefined, 'api')()).not.toThrow();
  });

  it('does not write a header that would be too late or empty', async () => {
    const { sendServerTiming } = await load(true);
    const sent = { ...res(), headersSent: true };

    sendServerTiming({ __serverTiming: ['api;dur=1.0'] }, sent);
    expect(sent.headers).toEqual({});

    const response = res();
    sendServerTiming({}, response);
    sendServerTiming(undefined, response);
    expect(response.headers).toEqual({});
  });
});
