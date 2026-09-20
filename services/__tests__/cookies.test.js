import { describe, it, expect, vi, afterEach } from 'vitest';

import { getCookie, setCookie, deleteCookie } from '../cookies';

describe('getCookie', () => {
  const AUTH = 'otp_auth_token';

  it('finds the cookie wherever it sits in the header', () => {
    expect(getCookie(AUTH, 'otp_auth_token=abc123; _ga=GA1.1.5')).toBe('abc123');
    expect(getCookie(AUTH, '_ga=GA1.1.5; otp_auth_token=abc123; _hjSession=9')).toBe('abc123');
  });

  it('tolerates headers that omit the space after the semicolon', () => {
    expect(getCookie(AUTH, '_ga=GA1.1.5;otp_auth_token=abc123')).toBe('abc123');
    expect(getCookie(AUTH, ' otp_auth_token=abc123')).toBe('abc123');
  });

  it('returns null for a visitor carrying only analytics cookies', () => {
    expect(getCookie(AUTH, '_ga=GA1.1.5; _hjSession=9; osano_consent=1')).toBeNull();
  });

  it('does not match a cookie whose name merely ends with the key', () => {
    expect(getCookie(AUTH, 'x_otp_auth_token=nope; _ga=1')).toBeNull();
  });

  it('keeps "=" inside the value, so base64 padding survives', () => {
    expect(getCookie(AUTH, '_ga=1; otp_auth_token=YWJjMTIz==')).toBe('YWJjMTIz==');
  });

  it('returns null for an absent or empty header', () => {
    expect(getCookie(AUTH, '')).toBeNull();
    expect(getCookie(AUTH, undefined)).toBeNull();
    expect(getCookie('', 'otp_auth_token=abc123')).toBeNull();
  });
});

describe('setCookie / deleteCookie', () => {
  // the browser turns each assignment into one stored cookie; here the last write is enough
  const documentStub = () => {
    const doc = { cookie: '' };
    vi.stubGlobal('document', doc);
    return doc;
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('writes a session cookie without an expiry', () => {
    const doc = documentStub();

    setCookie('otp_auth_token', 'abc123');

    expect(doc.cookie).toBe('otp_auth_token=abc123; path=/');
  });

  it('expires a cookie the given number of days ahead', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const doc = documentStub();

    setCookie('otp_auth_token', 'abc123', 30);

    expect(doc.cookie).toBe(`otp_auth_token=abc123; expires=${new Date('2026-01-31T00:00:00Z').toUTCString()}; path=/`);
  });

  it('reads back what it wrote', () => {
    documentStub();

    setCookie('otp_auth_token', 'abc123');

    expect(getCookie('otp_auth_token')).toBe('abc123');
  });

  it('deletes by expiring in the past', () => {
    const doc = documentStub();

    deleteCookie('otp_auth_token');

    expect(doc.cookie).toBe('otp_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;');
    expect(getCookie('otp_auth_token')).toBe('');
  });
});
