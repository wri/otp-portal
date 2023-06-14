export function transformRequest(uri) {
  if (uri.startsWith(process.env.OTP_API)) {
    return {
      url: uri,
      headers: {
        'Content-Type': 'application/json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    };
  }

  return null;
}
