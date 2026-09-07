import { describe, it, expect, beforeEach, vi } from 'vitest';

import API from '../api';

const okResponse = () => ({
  ok: true,
  status: 200,
  json: async () => ({ data: [] })
});

describe('API auth opt-out', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => okResponse());
  });

  const lastCall = () => global.fetch.mock.calls[0][1];

  it('sends the session by default', async () => {
    await API.get('operators', {}, { cookie: 'otp_auth_token=abc' });

    expect(lastCall().credentials).toBe('include');
    expect(lastCall().headers.cookie).toBe('otp_auth_token=abc');
  });

  it('drops the session when the request asks for public content', async () => {
    await API.get('operators', {}, { auth: false, cookie: 'otp_auth_token=abc' });

    expect(lastCall().credentials).toBe('omit');
    expect(lastCall().headers.cookie).toBeUndefined();
  });
});
