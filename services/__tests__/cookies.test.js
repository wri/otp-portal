import { describe, it, expect } from 'vitest';

import { getCookie } from '../cookies';

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
